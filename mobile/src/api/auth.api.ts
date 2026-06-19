import axios from 'axios';
import client from './client';

const BASE = process.env.EXPO_PUBLIC_API_URL;

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/register`, { name, email, password });
    return data;
  },
  verifyEmail: async (email: string, otp: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/verify-email`, { email, otp });
    return data;
  },
  resendOtp: async (email: string, purpose: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/resend-otp`, { email, purpose });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/login`, { email, password });
    return data;
  },
  refreshToken: async (refreshToken: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/refresh-token`, { refreshToken });
    return data;
  },
  logout: async (refreshToken: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/logout`, { refreshToken });
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/forgot-password`, { email });
    return data;
  },
  resetPassword: async (email: string, token: string, newPassword: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/reset-password`, { email, token, newPassword });
    return data;
  },
  getMe: async (accessToken: string) => {
    const { data } = await axios.get(`${BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  },
};
