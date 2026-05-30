import { useQuery } from '@tanstack/react-query';
import { matchService } from '../../services/matchService';

export const useAllMatches = (status?: string) => {
  return useQuery({
    queryKey: ['matches', status],
    queryFn: () => matchService.getAllMatches(status),
  });
};

export const useMatchDetail = (matchId: string) => {
  return useQuery({
    queryKey: ['matchDetail', matchId],
    queryFn: () => matchService.getMatchDetail(matchId),
    enabled: !!matchId,
  });
};
