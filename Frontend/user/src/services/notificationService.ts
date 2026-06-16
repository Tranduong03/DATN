import axiosClient from '../api/axiosClient';

export const notificationService = {
  getMyNotifications: () => {
    return axiosClient.get('/notifications').then(res => (res as any).data);
  },
  getUnreadCount: () => {
    return axiosClient.get('/notifications/unread-count').then(res => (res as any).data);
  },
  markAsRead: (id: string) => {
    return axiosClient.post(`/notifications/${id}/read`).then(res => (res as any).data);
  },
  markAllAsRead: () => {
    return axiosClient.post('/notifications/read-all').then(res => (res as any).data);
  }
};
