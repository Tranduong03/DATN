import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useSignalR } from '../../hooks/useSignalR';

export default function GlobalNotification() {
  const connection = useSignalR();
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.on('ReceiveNotification', (message: string) => {
            setNotification(message);
            // Hide after 5 seconds
            setTimeout(() => setNotification(null), 5000);
          });
        })
        .catch(err => console.error('SignalR Connection Error: ', err));
    }
  }, [connection]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#fff',
            color: '#0f172a',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '90%',
            border: '1px solid #e2e8f0',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          <div style={{ backgroundColor: '#e0e7ff', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <Bell size={18} color="#4f46e5" />
          </div>
          {notification}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
