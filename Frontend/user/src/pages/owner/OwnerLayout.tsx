import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, ClipboardCheck } from 'lucide-react';
import { useOwnerBookings } from '../../hooks/queries/useBookingQueries';

interface OwnerLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSystemHeader?: boolean;
  showBottomNav?: boolean;
}

export default function OwnerLayout({ children, title, showSystemHeader = true, showBottomNav = true }: OwnerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get pending count for badge
  const { data: bookingsData } = useOwnerBookings();
  const bookingsList = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.data || [];
  const pendingCount = bookingsList.filter((b: any) => b.status === 'PENDING').length || 0;

  // Active status flags
  const isHomeActive = location.pathname === '/owner' || 
                       ['/owner/pos', '/owner/inventory', '/owner/analytics', '/owner/customers', '/owner/vouchers', '/owner/monthly-bookings', '/owner/venues'].some(path => location.pathname.startsWith(path));
  
  const isBookingsActive = location.pathname === '/owner/bookings' && !location.search.includes('status=PENDING');
  
  const isApprovalsActive = location.pathname === '/owner/bookings' && location.search.includes('status=PENDING');

  return (
    <div className="owner-mobile-container">
      {/* Page Header (only shown if title exists and header is enabled) */}
      {showSystemHeader && title && (
        <header className="owner-mobile-header">
          <button className="owner-header-back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="owner-header-title">{title}</span>
          <div style={{ width: 36 }}></div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="owner-mobile-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="owner-mobile-bottom-nav">
          <Link 
            to="/owner" 
            className={`owner-bottom-nav-item ${isHomeActive ? 'active' : ''}`}
          >
            <Home size={22} />
            <span>Trang chủ</span>
          </Link>
          
          <Link 
            to="/owner/bookings" 
            className={`owner-bottom-nav-item ${isBookingsActive ? 'active' : ''}`}
          >
            <Calendar size={22} />
            <span>Lịch đặt</span>
          </Link>
          
          <Link 
            to="/owner/bookings?status=PENDING" 
            className={`owner-bottom-nav-item ${isApprovalsActive ? 'active' : ''}`}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <ClipboardCheck size={22} />
              {pendingCount > 0 && (
                <span className="owner-nav-badge">{pendingCount}</span>
              )}
            </div>
            <span>Duyệt đơn</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
