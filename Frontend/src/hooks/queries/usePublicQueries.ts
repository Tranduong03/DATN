import { useQuery } from '@tanstack/react-query';
import { publicService } from '../../services/publicService';

export const usePublicVenues = (search?: string) => {
  return useQuery({
    queryKey: ['publicVenues', search],
    queryFn: () => publicService.getVenues(search),
    staleTime: 1000 * 60 * 2, // 2 phút 
  });
};

export const usePublicVenueDetail = (id: string) => {
  return useQuery({
    queryKey: ['publicVenueDetail', id],
    queryFn: () => publicService.getVenueDetail(id),
    enabled: !!id,
  });
};

export const useSportCategories = () => {
  return useQuery({
    queryKey: ['sportCategories'],
    queryFn: () => publicService.getSportCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
