import axiosClient from '../api/axiosClient';

export const adminService = {
  getUsers: (params: string = '') => {
    return axiosClient.get(`/admin/users${params ? '?' + params : ''}`);
  },

  getOwnerRequests: (params: string = '') => {
    return axiosClient.get(`/admin/owner-requests${params}`);
  },

  getOwnerRequestDetail: (userId: string) => {
    return axiosClient.get(`/admin/owner-requests/${userId}`);
  },

  approveOwnerRequest: (userId: string) => {
    return axiosClient.post(`/admin/owner-requests/${userId}/approve`);
  },

  rejectOwnerRequest: (userId: string, reason: string) => {
    return axiosClient.post(`/admin/owner-requests/${userId}/reject`, { reason });
  }
};
