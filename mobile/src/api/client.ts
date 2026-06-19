import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'refresh_token';

// Shared axios instance — base URL from Expo env variable
const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

// We use a getter so we can access fresh token from AuthContext
// This is set by the auth context after login
let getToken: (() => string | null) | null = null;
let onTokenRefreshed: ((token: string, refresh: string) => void) | null = null;
let onLogout: (() => void) | null = null;

export const setupInterceptors = (
  tokenGetter: () => string | null,
  tokenSetter: (at: string, rt: string) => void,
  logoutFn: () => void
) => {
  getToken = tokenGetter;
  onTokenRefreshed = tokenSetter;
  onLogout = logoutFn;
};

// Request interceptor: attach access token from context
client.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 → attempt token refresh once
let isRefreshing = false;
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
          if (!refreshToken) throw new Error('No refresh token');
          const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh-token`, { refreshToken });
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
          onTokenRefreshed?.(data.accessToken, data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return client(originalRequest);
        } catch {
          onLogout?.();
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
