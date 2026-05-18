import axiosClient from '../api/axiosClient';

export const ownerService = {
  getOnboardingStatus: () => {
    return axiosClient.get('/OwnerOnboarding/status');
  },

  saveDraft: (data: any) => {
    return axiosClient.post('/OwnerOnboarding/save-draft', data);
  },

  submitOnboarding: (data: any) => {
    return axiosClient.post('/OwnerOnboarding/submit', data);
  }
};
