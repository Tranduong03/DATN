import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../../services/reviewService';

export const useVenueReviews = (venueId: string) => {
  return useQuery({
    queryKey: ['reviews', venueId],
    queryFn: () => reviewService.getVenueReviews(venueId),
    enabled: !!venueId,
  });
};
