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
  },
  getOwnerBookings: () => {
    return axiosClient.get('/bookings/owner').then(res => (res as any).data);
  },
  updateOwnerBookingStatus: (bookingId: string, status: string) => {
    return axiosClient.put(`/bookings/owner/${bookingId}/status`, { status }).then(res => (res as any).data);
  },
  getOwnerStats: () => {
    return axiosClient.get('/bookings/owner/stats').then(res => (res as any).data);
  },
  getPaymentUrl: (bookingId: string) => {
    return axiosClient.get(`/payment/vnpay/${bookingId}`).then(res => (res as any).paymentUrl);
  }
};
