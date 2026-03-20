import api from './axios';

export const userService = {
  blockUser: async (uid) => {
    const response = await api.post(`/users/block/${uid}`);
    return response.data;
  }
};
