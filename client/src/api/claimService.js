import api from './axios';

export const claimService = {
  submitClaim: async (formData) => {
    const response = await api.post('/claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getClaimsForItem: async (itemId) => {
    const response = await api.get(`/claims/item/${itemId}`);
    return response.data;
  },
  updateClaimStatus: async (claimId, status) => {
    const response = await api.patch(`/claims/${claimId}`, { status });
    return response.data;
  }
};
