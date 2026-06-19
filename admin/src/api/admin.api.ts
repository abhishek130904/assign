import client from './client';

export const adminApi = {
  getStats: async () => {
    const { data } = await client.get('/api/admin/stats');
    return data;
  },
  getUsers: async (params: Record<string, any>) => {
    const { data } = await client.get('/api/admin/users', { params });
    return data;
  },
  getUserById: async (id: string) => {
    const { data } = await client.get(`/api/admin/users/${id}`);
    return data;
  },
  toggleActive: async (id: string) => {
    const { data } = await client.patch(`/api/admin/users/${id}/toggle-active`);
    return data;
  },
  changeRole: async (id: string, role: string) => {
    const { data } = await client.patch(`/api/admin/users/${id}/change-role`, { role });
    return data;
  },
};
