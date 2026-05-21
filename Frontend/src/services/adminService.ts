import adminAxiosClient from '../api/adminAxiosClient';

export const adminService = {
  getUsers: (params: string = '') => {
    return adminAxiosClient.get(`/admin/users${params ? '?' + params : ''}`);
  },

  getOwnerRequests: (params: string = '') => {
    return adminAxiosClient.get(`/admin/owner-requests${params}`);
  },

  getOwnerRequestDetail: (userId: string) => {
    return adminAxiosClient.get(`/admin/owner-requests/${userId}`);
  },

  approveOwnerRequest: (userId: string) => {
    return adminAxiosClient.post(`/admin/owner-requests/${userId}/approve`);
  },

  rejectOwnerRequest: (userId: string, reason: string) => {
    return adminAxiosClient.post(`/admin/owner-requests/${userId}/reject`, { reason });
  },

  createSportCategory: (data: any) => {
    return adminAxiosClient.post('/SportCategories', data);
  },

  updateSportCategory: (id: number, data: any) => {
    return adminAxiosClient.put(`/SportCategories/${id}`, data);
  },

  deleteSportCategory: (id: number) => {
    return adminAxiosClient.delete(`/SportCategories/${id}`);
  }
};
