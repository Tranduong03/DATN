import OwnerLayout from './OwnerLayout';

export default function OwnerDashboardPage() {
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
            <span className="admin-stat-value">0</span>
            <span className="admin-stat-label">Lượt đặt hôm nay</span>
            <span className="admin-stat-trend">Chưa có dữ liệu</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--emerald">
          <div className="admin-stat-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-value">0 VNĐ</span>
            <span className="admin-stat-label">Doanh thu tuần này</span>
            <span className="admin-stat-trend">Chưa có dữ liệu</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--amber">
          <div className="admin-stat-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-value">0</span>
            <span className="admin-stat-label">Đánh giá mới</span>
            <span className="admin-stat-trend">Chưa có dữ liệu</span>
          </div>
        </div>
      </div>

      <div className="admin-section" style={{ marginTop: 24 }}>
        <h2 className="admin-section-title">Lịch đặt sắp tới</h2>
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
          Hiện chưa có lịch đặt nào.
        </div>
      </div>
    </OwnerLayout>
  );
}
