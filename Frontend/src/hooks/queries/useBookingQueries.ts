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
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingService.getMyBookings(),
  });
};
