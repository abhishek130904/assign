import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';

interface AdminUser { id: string; name: string; email: string; role: string; }

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('admin_access_token');
      if (!token) { setIsLoading(false); return; }
      try {
        const me = await authApi.getMe(token);
        if (me.role !== 'admin') { logout(); return; }
        setUser({ id: me._id, name: me.name, email: me.email, role: me.role });
      } catch {
        // Token invalid — interceptor will try refresh; if it fails, user stays null
      } finally { setIsLoading(false); }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    if (data.user.role !== 'admin') throw new Error('Admin access only');
    // NOTE: Storing tokens in localStorage is acceptable for internal admin tools.
    // For higher security, use httpOnly cookies (requires backend change).
    localStorage.setItem('admin_access_token', data.accessToken);
    localStorage.setItem('admin_refresh_token', data.refreshToken);
    setUser({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role });
  };

  const logout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
