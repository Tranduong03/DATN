import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { queryKeys } from '../queryKeys';

export const useApproveOwnerRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminService.approveOwnerRequest(userId),
    onSuccess: () => {
      // Invalidate relevant queries to trigger a refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.ownerRequests('All') });
      queryClient.invalidateQueries({ queryKey: queryKeys.ownerRequests('Pending') });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
    }
  });
};

export const useRejectOwnerRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) => 
      adminService.rejectOwnerRequest(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ownerRequests('All') });
      queryClient.invalidateQueries({ queryKey: queryKeys.ownerRequests('Pending') });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
    }
  });
};
