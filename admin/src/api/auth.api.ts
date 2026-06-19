import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await axios.post(`${BASE}/api/auth/login`, { email, password });
    return data;
  },
  getMe: async (token: string) => {
    const { data } = await axios.get(`${BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
