import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useSignalR } from '../../hooks/useSignalR';
import { useQueryClient } from '@tanstack/react-query';
import './GlobalNotification.css';

export default function GlobalNotification() {
  const connection = useSignalR();
  const [notification, setNotification] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.on('ReceiveNotification', (message: string) => {
            setNotification(message);
            // Invalidate queries so that badge count and notification list auto-refresh
            queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
            // Hide after 5 seconds
            setTimeout(() => setNotification(null), 5000);
          });
        })
        .catch(err => console.error('SignalR Connection Error: ', err));
    }
  }, [connection, queryClient]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="global-notification-toast"
        >
          <div className="global-notification-icon-wrapper">
            <Bell size={18} color="#4f46e5" />
          </div>
          {notification}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
