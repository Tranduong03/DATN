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
  },

  // --- Venue Management ---
  getMyVenues: () => {
    return axiosClient.get('/owner/venues').then(res => (res as any).data);
  },
  
  getVenueDetail: (venueId: string) => {
    return axiosClient.get(`/owner/venues/${venueId}`).then(res => (res as any).data);
  },

  // --- Courts ---
  getCourts: (venueId: string) => {
    return axiosClient.get(`/owner/venues/${venueId}/courts`).then(res => (res as any).data);
  },

  addCourt: (venueId: string, data: { courtName: string; status?: string }) => {
    return axiosClient.post(`/owner/venues/${venueId}/courts`, data).then(res => (res as any).data);
  },

  updateCourt: (venueId: string, courtId: string, data: { courtName: string; status: string }) => {
    return axiosClient.put(`/owner/venues/${venueId}/courts/${courtId}`, data).then(res => (res as any).data);
  },

  // --- Pricing ---
  getPriceRules: (venueId: string) => {
    return axiosClient.get(`/owner/venues/${venueId}/pricerules`).then(res => (res as any).data);
  },

  upsertPriceRules: (venueId: string, data: any[]) => {
    return axiosClient.post(`/owner/venues/${venueId}/pricerules`, data).then(res => (res as any).data);
  }
};
