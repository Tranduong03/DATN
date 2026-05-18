import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerService } from '../../services/ownerService';
import { queryKeys } from '../queryKeys';

export const useSaveDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => ownerService.saveDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboardingStatus });
    }
  });
};

export const useSubmitOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => ownerService.submitOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboardingStatus });
    }
  });
};
