import { useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '../../services/matchService';

export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { 
      bookingId: string; 
      title: string; 
      skillLevel: string; 
      maxPlayers: number; 
      feePerPlayer: number; 
    }) => matchService.createMatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
};

export const useJoinMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.joinMatch(matchId),
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matchDetail', matchId] });
    }
  });
};

export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, userId }: { matchId: string, userId: string }) => 
      matchService.approveJoinRequest(matchId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matchDetail', variables.matchId] });
    }
  });
};
