import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { queryKeys } from '../queryKeys';

export const useAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: async () => {
      const [usersRes, requestsRes] = await Promise.all([
        adminService.getUsers('page=1&pageSize=1'),
        adminService.getOwnerRequests()
      ]);
      const totalUsers = (usersRes as any)?.data?.totalCount ?? 0;
      const allRequests: any[] = (requestsRes as any)?.data ?? [];
      
      return {
        totalUsers,
        pendingRequests: allRequests.filter((r: any) => r.verificationStatus === 'Pending').length,
        verifiedOwners: allRequests.filter((r: any) => r.verificationStatus === 'Verified').length,
        rejectedRequests: allRequests.filter((r: any) => r.verificationStatus === 'Rejected').length,
      };
    }
  });
};

export const useAdminUsers = (page: number, search: string) => {
  return useQuery({
    queryKey: queryKeys.adminUsers(page, search),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '15', // Matches pageSize in AdminUsersPage
        ...(search ? { search } : {}),
      });
      const data: any = await adminService.getUsers(params.toString());
      if (data.isSuccess) {
        return {
          items: data.data.items,
          totalPages: data.data.totalPages,
          totalCount: data.data.totalCount
        };
      }
      throw new Error(data.message || 'Failed to fetch users');
    }
  });
};

export const useOwnerRequests = (status: string) => {
  return useQuery({
    queryKey: queryKeys.ownerRequests(status),
    queryFn: async () => {
      const params = status !== 'All' ? `?status=${status}` : '';
      const data: any = await adminService.getOwnerRequests(params);
      if (data.isSuccess) return data.data;
      throw new Error(data.message || 'Failed to fetch owner requests');
    }
  });
};

export const useOwnerRequestDetail = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.ownerRequestDetail(userId),
    queryFn: async () => {
      const data: any = await adminService.getOwnerRequestDetail(userId);
      if (data.isSuccess) return data.data;
      throw new Error(data.message || 'Failed to fetch detail');
    },
    enabled: !!userId, // Only fetch when userId is truthy
  });
};
