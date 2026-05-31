import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, CreateReviewDto } from '../../services/reviewService';

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDto) => reviewService.createReview(data),
    onSuccess: (data) => {
      // Invalidate both venue detail and venue reviews
      queryClient.invalidateQueries({ queryKey: ['reviews', data.venueId] });
      queryClient.invalidateQueries({ queryKey: ['venueDetail', data.venueId] });
      // Also invalidate myBookings so the UI knows this booking has a review now
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
};
