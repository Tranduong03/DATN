import { Navigate } from 'react-router-dom';
import OwnerLayout from './OwnerLayout';
import { useMyVenues } from '../../hooks/queries/useOwnerQueries';

export default function OwnerVenuesPage() {
  const { data: venues, isLoading } = useMyVenues();

  if (isLoading) {
    return (
      <OwnerLayout title="Đang tải..." subtitle="Đang lấy thông tin cơ sở của bạn">
        <div className="admin-section">
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  // Enforce 1 owner = 1 venue
  // Redirect to the config page of the first venue
  if (venues && venues.length > 0) {
    return <Navigate to={`/owner/venues/${venues[0].id}`} replace />;
  }

  return (
    <OwnerLayout title="Quản lý Cơ sở" subtitle="Chưa tìm thấy cơ sở nào.">
      <div className="admin-section">
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
          Tài khoản của bạn chưa được gắn với cơ sở thể thao nào. <br />
          Vui lòng liên hệ quản trị viên (Admin) để được hỗ trợ.
        </div>
      </div>
    </OwnerLayout>
  );
}
