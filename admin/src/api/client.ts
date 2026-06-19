import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

const client = axios.create({ baseURL: BASE });

// Attach access token from localStorage on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: try refresh, retry once, else clear + redirect
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const rt = localStorage.getItem('admin_refresh_token');
        if (!rt) throw new Error('no refresh token');
        const { data } = await axios.post(`${BASE}/api/auth/refresh-token`, { refreshToken: rt });
        localStorage.setItem('admin_access_token', data.accessToken);
        localStorage.setItem('admin_refresh_token', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
