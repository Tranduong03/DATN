import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { queryKeys } from '../queryKeys';

export const useApproveOwnerRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => adminService.approveOwnerRequest(userId),
    onSuccess: (_data, userId) => {
      // Dùng partial key ['ownerRequests'] → invalidate TẤT CẢ tab: All, Pending, Verified, Rejected
      queryClient.invalidateQueries({ queryKey: ['ownerRequests'] });
      // Xóa cache chi tiết của user vừa được duyệt
      queryClient.removeQueries({ queryKey: queryKeys.ownerRequestDetail(userId) });
      // Cập nhật stats
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
    }
  });
};

export const useRejectOwnerRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) => 
      adminService.rejectOwnerRequest(userId, reason),
    onSuccess: (_data, variables) => {
      // Dùng partial key ['ownerRequests'] → invalidate TẤT CẢ tab cùng lúc
      queryClient.invalidateQueries({ queryKey: ['ownerRequests'] });
      // Xóa cache chi tiết của user vừa bị từ chối
      queryClient.removeQueries({ queryKey: queryKeys.ownerRequestDetail(variables.userId) });
      // Cập nhật stats
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
    }
  });
};
