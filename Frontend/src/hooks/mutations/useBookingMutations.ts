import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../../services/bookingService';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { courtId: string, startTime: string, endTime: string }) => bookingService.createBooking(data),
    onSuccess: () => {
      // Invalidate both availability and myBookings
      queryClient.invalidateQueries({ queryKey: ['venueAvailability'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    }
  });
};
