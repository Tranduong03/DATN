import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, ClipboardCheck } from 'lucide-react';
import { useOwnerBookings } from '../../hooks/queries/useBookingQueries';
import './BottomNavOwner.css';

export default function BottomNavOwner() {
  const location = useLocation();

  // Get pending count for badge
  const { data: bookingsData } = useOwnerBookings();
  const bookingsList = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.data || [];
  const pendingCount = bookingsList.filter((b: any) => b.status === 'PENDING').length || 0;

  // Active status flags
  const isHomeActive = location.pathname === '/owner' ||
    ['/owner/pos', '/owner/inventory', '/owner/analytics', '/owner/customers', '/owner/vouchers', '/owner/monthly-bookings', '/owner/venues'].some(path => location.pathname.startsWith(path));

  const isBookingsActive = location.pathname === '/owner/bookings';

  const isApprovalsActive = location.pathname === '/owner/BookingServices';

  return (
    <nav className="owner-mobile-bottom-nav">
      <Link
        to="/owner"
        className={`owner-bottom-nav-item ${isHomeActive ? 'active' : ''}`}
      >
        <Home size={28} />
        <span>Trang chủ</span>
      </Link>

      <Link
        to="/owner/bookings"
        className={`owner-bottom-nav-item ${isBookingsActive ? 'active' : ''}`}
      >
        <Calendar size={28} />
        <span>Lịch đặt</span>
      </Link>

      <Link
        to="/owner/BookingServices"
        className={`owner-bottom-nav-item ${isApprovalsActive ? 'active' : ''}`}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <ClipboardCheck size={28} />
          {pendingCount > 0 && (
            <span className="owner-nav-badge">{pendingCount}</span>
          )}
        </div>
        <span>Dịch vụ</span>
      </Link>
    </nav>
  );
}
