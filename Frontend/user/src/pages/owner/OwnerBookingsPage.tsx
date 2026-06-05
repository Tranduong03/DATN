import { useState } from 'react';
import OwnerLayout from './OwnerLayout';
import { useOwnerBookings } from '../../hooks/queries/useBookingQueries';
import { useUpdateBookingStatus } from '../../hooks/mutations/useBookingMutations';
import { Search, Calendar } from 'lucide-react';

interface BookingItem {
  id: string;
  bookerName?: string;
  bookerPhone?: string;
  status: string;
  courtName: string;
  totalPrice: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}


export default function OwnerBookingsPage() {
  const { data: bookingsData, isLoading } = useOwnerBookings();
  const updateStatusMutation = useUpdateBookingStatus();
  
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const bookings = bookingsData?.data || [];

  const handleUpdateStatus = (id: string, status: string) => {
    if (confirm(`Bạn có chắc muốn cập nhật đơn đặt thành ${status}?`)) {
      updateStatusMutation.mutate({ bookingId: id, status });
    }
  };

  const filteredBookings = bookings.filter((b: BookingItem) => {
    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchSearch = (b.bookerName || '').toLowerCase().includes(search.toLowerCase()) || 
                        (b.bookerPhone || '').includes(search);
    return matchStatus && matchSearch;
  });

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <OwnerLayout title="Quản lý Đơn đặt sân" subtitle="Danh sách chi tiết tất cả các lượt đặt sân tại cơ sở của bạn.">
      <div className="admin-section">
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Tìm theo tên, SĐT khách hàng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff', minWidth: 150 }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán / Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
            Không tìm thấy lượt đặt sân nào phù hợp.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Thời gian đặt</th>
                  <th>Sân con</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b: BookingItem) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.bookerName}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{b.bookerPhone || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="#6366f1" />
                        {new Date(b.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                        {new Date(b.startTime).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td>{b.courtName}</td>
                    <td style={{ fontWeight: 600, color: '#ef4444' }}>{formatPrice(b.totalPrice)}</td>
                    <td>
                      <span className={`admin-status-badge ${b.status === 'CONFIRMED' ? 'admin-status-badge--success' : b.status === 'PENDING' ? 'admin-status-badge--warning' : 'admin-status-badge--danger'}`}>
                        {b.status}
                      </span>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                        Tạo lúc: <br/>{formatDate(b.createdAt)}
                      </div>
                    </td>
                    <td>
                      {b.status === 'PENDING' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Xác nhận</button>
                          <button onClick={() => handleUpdateStatus(b.id, 'CANCELLED')} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Hủy</button>
                        </div>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                           <button onClick={() => handleUpdateStatus(b.id, 'CANCELLED')} style={{ padding: '6px 12px', background: '#f3f4f6', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Hủy (Khách không đến)</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
