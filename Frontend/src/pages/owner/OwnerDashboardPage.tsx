import { Link } from 'react-router-dom';
import OwnerLayout from './OwnerLayout';
import { useOwnerStats, useOwnerBookings } from '../../hooks/queries/useBookingQueries';
import { useUpdateBookingStatus } from '../../hooks/mutations/useBookingMutations';

export default function OwnerDashboardPage() {
  const { data: statsData } = useOwnerStats();
  const { data: bookingsData } = useOwnerBookings();
  const updateStatusMutation = useUpdateBookingStatus();

  const stats = statsData?.data || { todayBookings: 0, weeklyRevenue: 0, newReviews: 0 };
  const bookings = bookingsData?.data || [];

  const upcomingBookings = bookings
    .filter((b: any) => new Date(b.startTime) >= new Date() && b.status !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5); // Take top 5 upcoming

  const handleUpdateStatus = (id: string, status: string) => {
    if (confirm(`Bạn có chắc muốn cập nhật thành ${status}?`)) {
      updateStatusMutation.mutate({ bookingId: id, status });
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  return (
    <OwnerLayout title="Tổng quan" subtitle="Chào mừng trở lại! Dưới đây là thông tin hoạt động kinh doanh của bạn.">
      <div className="admin-stats-grid">
        <div className="admin-stat-card admin-stat-card--indigo">
          <div className="admin-stat-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-value">{stats.todayBookings}</span>
            <span className="admin-stat-label">Lượt đặt hôm nay</span>
            <span className="admin-stat-trend" style={{ color: '#6366f1' }}>Cập nhật liên tục</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--emerald">
          <div className="admin-stat-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-value">{formatPrice(stats.weeklyRevenue)}</span>
            <span className="admin-stat-label">Doanh thu tuần này</span>
            <span className="admin-stat-trend" style={{ color: '#10b981' }}>Đã xác nhận</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--amber">
          <div className="admin-stat-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-value">{stats.newReviews}</span>
            <span className="admin-stat-label">Đánh giá mới</span>
            <span className="admin-stat-trend">Đang phát triển</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
        {/* Biểu đồ doanh thu giả lập (CSS) */}
        <div className="admin-section" style={{ margin: 0 }}>
          <h2 className="admin-section-title">Biểu đồ doanh thu (7 ngày qua)</h2>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '16px 0 0 0', borderBottom: '1px solid #e2e8f0' }}>
            {[12, 18, 15, 25, 20, 35, 45].map((val, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '100%', backgroundColor: '#e0e7ff', borderRadius: '4px 4px 0 0', position: 'relative', height: '180px', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', backgroundColor: '#6366f1', borderRadius: '4px 4px 0 0', height: `${val * 2}%`, transition: 'height 0.5s ease-in-out' }}></div>
                  <span style={{ position: 'absolute', top: '-24px', width: '100%', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>{val}k</span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>T{idx + 2}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '12px' }}>Doanh thu tính theo (k VND)</p>
        </div>

        {/* Lịch đặt gần đây */}
        <div className="admin-section" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>Lịch đặt sắp tới</h2>
            <Link to="/owner/bookings" className="admin-btn-secondary" style={{ fontSize: 13 }}>Xem tất cả</Link>
          </div>
          
          {upcomingBookings.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
              Hiện chưa có lịch đặt nào sắp diễn ra.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingBookings.map((b: any) => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{b.bookerName}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{b.courtName} • {new Date(b.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#ef4444', fontSize: '14px' }}>{formatPrice(b.totalPrice)}</div>
                    <span className={`admin-status-badge ${b.status === 'CONFIRMED' ? 'admin-status-badge--success' : b.status === 'PENDING' ? 'admin-status-badge--warning' : 'admin-status-badge--danger'}`} style={{ marginTop: '4px', fontSize: '10px', padding: '2px 6px' }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}
