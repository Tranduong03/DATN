import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';

export const useVenueAvailability = (venueId: string, date: string) => {
  return useQuery({
    queryKey: ['venueAvailability', venueId, date],
    queryFn: () => bookingService.getAvailability(venueId, date),
    enabled: !!venueId && !!date,
    refetchInterval: 1000 * 30, // Tự động refetch mỗi 30s để cập nhật giờ trống
  });
};

export const useMyBookings = () => {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.getMyBookings(),
    enabled: !!token,
  });
};

export const useOwnerBookings = () => {
  return useQuery({
    queryKey: ['ownerBookings'],
    queryFn: () => bookingService.getOwnerBookings(),
  });
};

export const useOwnerStats = () => {
  return useQuery({
    queryKey: ['ownerStats'],
    queryFn: () => bookingService.getOwnerStats(),
  });
};
