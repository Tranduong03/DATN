import { useQuery } from '@tanstack/react-query';
import { ownerService } from '../../services/ownerService';
import { queryKeys } from '../queryKeys';

export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: queryKeys.onboardingStatus,
    queryFn: async () => {
      const response = await ownerService.getOnboardingStatus();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 phút
    retry: 1, // thử lại 1 lần nếu lỗi
  });
};

export const useMyVenues = () => {
  return useQuery({
    queryKey: ['ownerVenues'],
    queryFn: () => ownerService.getMyVenues(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useVenueDetail = (venueId: string) => {
  return useQuery({
    queryKey: ['ownerVenues', venueId],
    queryFn: () => ownerService.getVenueDetail(venueId),
    enabled: !!venueId,
  });
};

export const useCourts = (venueId: string) => {
  return useQuery({
    queryKey: ['ownerCourts', venueId],
    queryFn: () => ownerService.getCourts(venueId),
    enabled: !!venueId,
  });
};

export const usePriceRules = (venueId: string) => {
  return useQuery({
    queryKey: ['ownerPriceRules', venueId],
    queryFn: () => ownerService.getPriceRules(venueId),
    enabled: !!venueId,
  });
};
