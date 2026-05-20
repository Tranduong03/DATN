import axiosClient from '../api/axiosClient';

export const bookingService = {
  getAvailability: (venueId: string, date: string) => {
    return axiosClient.get(`/bookings/venues/${venueId}/availability`, { params: { date } }).then(res => (res as any).data);
  },
  createBooking: (data: { courtId: string, startTime: string, endTime: string }) => {
    return axiosClient.post('/bookings', data).then(res => (res as any).data);
  },
  getMyBookings: () => {
    return axiosClient.get('/bookings/my-bookings').then(res => (res as any).data);
  }
};
