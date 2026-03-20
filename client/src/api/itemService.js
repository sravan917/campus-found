import api from './axios';

export const itemService = {
  getAll: async (params = {}) => {
    const response = await api.get('/items', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  create: async (formData) => {
    // We use multipart/form-data for image uploads
    const response = await api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },
};
