import client from './client';

export const userApi = {
  getMe: async () => {
    const { data } = await client.get('/api/user/me');
    return data;
  },
};
