import { useMyNotifications } from '../../hooks/queries/useNotificationQueries';
import { useMarkAsRead, useMarkAllAsRead } from '../../hooks/mutations/useNotificationMutations';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import SubPageHeader from '../../components/common/SubPageHeader';

export default function NotificationsPage() {
  const { data: response, isLoading } = useMyNotifications();
  const notifications = response?.data || [];

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const hasUnread = notifications.some((n: any) => !n.isRead);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <SubPageHeader title="Thông báo của tôi" />

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '480px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {hasUnread && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '20px',
                backgroundColor: '#e2e8f0',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#cbd5e1'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
            >
              <CheckCheck size={16} />
              {markAllAsReadMutation.isPending ? 'Đang cập nhật...' : 'Đánh dấu đọc tất cả'}
            </button>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '200px' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#e2e8f0', padding: '16px', borderRadius: '50%', marginBottom: '16px', display: 'inline-flex' }}>
              <Bell size={32} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>Không có thông báo nào</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Hệ thống sẽ gửi thông báo cho bạn khi có cập nhật mới về đặt lịch, trận đấu hoặc đội nhóm.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item.id, item.isRead)}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: item.isRead ? '#ffffff' : '#f0fdf4',
                  border: item.isRead ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  cursor: item.isRead ? 'default' : 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <div style={{
                  backgroundColor: item.isRead ? '#f1f5f9' : '#dcfce7',
                  padding: '10px',
                  borderRadius: '12px',
                  height: 'fit-content',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bell size={20} color={item.isRead ? '#64748b' : '#16a34a'} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h4 style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: item.isRead ? '600' : '700',
                      color: item.isRead ? '#334155' : '#0f291e',
                    }}>
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        display: 'inline-block',
                        flexShrink: 0,
                        marginTop: '4px',
                      }} />
                    )}
                  </div>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '13px',
                    color: item.isRead ? '#64748b' : '#1e3a2f',
                    lineHeight: '1.4',
                  }}>
                    {item.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '11px' }}>
                    <Clock size={12} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
