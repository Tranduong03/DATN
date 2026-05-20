import axiosClient from '../api/axiosClient';

export const publicService = {
  getVenues: (search?: string) => {
    const params = search ? { search } : {};
    return axiosClient.get('/public/venues', { params }).then(res => (res as any).data);
  },
  getVenueDetail: (id: string) => {
    return axiosClient.get(`/public/venues/${id}`).then(res => (res as any).data);
  }
};
