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

export const useAddCourt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, data }: { venueId: string; data: any }) => ownerService.addCourt(venueId, data),
    onSuccess: (_, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerCourts', venueId] });
    },
  });
};

export const useUpdateCourt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, courtId, data }: { venueId: string; courtId: string; data: any }) => ownerService.updateCourt(venueId, courtId, data),
    onSuccess: (_, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerCourts', venueId] });
    },
  });
};

export const useUpsertPriceRules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, data }: { venueId: string; data: any[] }) => ownerService.upsertPriceRules(venueId, data),
    onSuccess: (_, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerPriceRules', venueId] });
    },
  });
};
