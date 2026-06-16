import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';

export const useMyNotifications = () => {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: ['myNotifications'],
    queryFn: () => notificationService.getMyNotifications(),
    enabled: !!token,
  });
};

export const useUnreadNotificationsCount = () => {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: !!token,
    refetchInterval: 1000 * 60, // Fallback refetch every 1 minute
  });
};
