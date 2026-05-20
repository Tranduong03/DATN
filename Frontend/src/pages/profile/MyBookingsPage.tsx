import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useMyBookings } from '../../hooks/queries/useBookingQueries';

export default function MyBookingsPage() {
  const { data: bookingsData, isLoading } = useMyBookings();
  const bookings = bookingsData?.data || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ padding: '4px 8px', borderRadius: 4, backgroundColor: '#fef3c7', color: '#d97706', fontSize: 12, fontWeight: 'bold' }}>CHỜ THANH TOÁN</span>;
      case 'CONFIRMED':
        return <span style={{ padding: '4px 8px', borderRadius: 4, backgroundColor: '#d1fae5', color: '#059669', fontSize: 12, fontWeight: 'bold' }}>ĐÃ XÁC NHẬN</span>;
      case 'CANCELLED':
        return <span style={{ padding: '4px 8px', borderRadius: 4, backgroundColor: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 'bold' }}>ĐÃ HỦY</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h1 style={{ marginBottom: 24 }}>Lịch sử đặt sân</h1>
        
        {isLoading ? (
          <p>Đang tải...</p>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, backgroundColor: '#f9fafb', borderRadius: 8 }}>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>Bạn chưa có lượt đặt sân nào.</p>
            <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Khám phá sân ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((booking: any) => (
              <div key={booking.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}><Link to={`/venue/${booking.venueId}`} style={{ color: '#111827', textDecoration: 'none' }}>{booking.venueName}</Link></h3>
                  <div style={{ color: '#4b5563', fontSize: 14, marginBottom: 4 }}>
                    <strong>Sân:</strong> {booking.courtName}
                  </div>
                  <div style={{ color: '#4b5563', fontSize: 14 }}>
                    <strong>Thời gian:</strong> {formatDate(booking.startTime)} - {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>Tổng tiền</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ef4444' }}>{formatPrice(booking.totalPrice)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
