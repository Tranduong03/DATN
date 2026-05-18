import { useQuery } from '@tanstack/react-query';
import { ownerService } from '../../services/ownerService';
import { queryKeys } from '../queryKeys';

export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: queryKeys.onboardingStatus,
    queryFn: async () => {
      const data: any = await ownerService.getOnboardingStatus();
      if (data.isSuccess) return data.data;
      throw new Error(data.message || 'Failed to fetch status');
    }
  });
};
