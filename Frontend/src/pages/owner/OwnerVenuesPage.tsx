import { Link } from 'react-router-dom';
import OwnerLayout from './OwnerLayout';
import { useMyVenues } from '../../hooks/queries/useOwnerQueries';

export default function OwnerVenuesPage() {
  const { data: venues, isLoading } = useMyVenues();

  return (
    <OwnerLayout title="Quản lý Sân" subtitle="Danh sách các cơ sở thể thao của bạn.">
      <div className="admin-section">
        {isLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="admin-table-container">
            {venues && venues.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên Sân</th>
                    <th>Địa chỉ</th>
                    <th>Giờ hoạt động</th>
                    <th>Quy mô (Sân con)</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue: any) => (
                    <tr key={venue.id}>
                      <td style={{ fontWeight: 600 }}>{venue.name}</td>
                      <td>{venue.address}</td>
                      <td>{venue.operatingStartHour} - {venue.operatingEndHour}</td>
                      <td>{venue.venueScale} sân</td>
                      <td>
                        <span className={`admin-status-badge ${venue.status === 'ACTIVE' ? 'admin-status-badge--success' : 'admin-status-badge--warning'}`}>
                          {venue.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/owner/venues/${venue.id}`} className="admin-btn-view">
                          Cấu hình
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                Bạn chưa có cơ sở thể thao nào.
              </div>
            )}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
