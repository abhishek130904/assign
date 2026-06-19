import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/auth.api';

const REFRESH_TOKEN_KEY = 'refresh_token';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount: try to restore session using stored refresh token
    const restore = async () => {
      try {
        const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!storedRefresh) return;

        // Attempt silent refresh
        const data = await authApi.refreshToken(storedRefresh);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
        setAccessToken(data.accessToken);

        // Fetch user info
        const userData = await authApi.getMe(data.accessToken);
        setUser({ id: userData._id, name: userData.name, email: userData.email, role: userData.role });
      } catch {
        // Refresh failed — clear storage and start unauthenticated
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const setTokens = async (newAccessToken: string, refreshToken: string, newUser: User) => {
    setAccessToken(newAccessToken);
    setUser(newUser);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    // Access token stays in memory only — never persisted
    await setTokens(data.accessToken, data.refreshToken, {
      id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role,
    });
  };

  const logout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        // Fire and forget — don't block UI on network
        authApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setUser(null);
      setAccessToken(null);
    }
  };

  const getAccessToken = () => accessToken;

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, getAccessToken, setTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
