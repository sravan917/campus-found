import api from './axios';

export const authService = {
  syncUser: async (name) => {
    // This hits the POST /api/auth/register endpoint using the Firebase JWT
    // stored by the AuthContext interceptor.
    const response = await api.post('/auth/register', { name });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};
