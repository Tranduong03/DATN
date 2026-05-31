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

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, data }: { venueId: string; data: any }) => ownerService.updateVenue(venueId, data),
    onSuccess: (_, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerVenues', venueId] });
      queryClient.invalidateQueries({ queryKey: ['ownerVenues'] });
    },
  });
};

export const useAddVenueImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, data }: { venueId: string; data: { imageUrl: string; imageType: string } }) => ownerService.addVenueImage(venueId, data),
    onSuccess: (_, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerVenues', venueId] });
    },
  });
};

export const useDeleteVenueImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ venueId, imageId }: { venueId: string; imageId: string }) => ownerService.deleteVenueImage(venueId, imageId),
    onSuccess: (_, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerVenues', venueId] });
    },
  });
};
