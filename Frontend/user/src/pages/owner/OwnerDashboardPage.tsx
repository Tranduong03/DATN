import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OwnerLayout from './OwnerLayout';
import { useMyVenues } from '../../hooks/queries/useOwnerQueries';
import { Layout, ShoppingCart, Package, TrendingUp, Layers, Users, Ticket, Calendar, LogOut, QrCode } from 'lucide-react';

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const { data: venues } = useMyVenues();

  // Determine venue name and avatar
  const venue = venues && venues.length > 0 ? venues[0] : null;
  const venueName = venue?.name || 'Sân thể thao Sport Connect';
  
  const [showExitModal, setShowExitModal] = useState(false);

  const handleGoBackToUser = () => {
    setShowExitModal(true);
  };

  const handleScanQR = () => {
    alert('Tính năng chưa cập nhật...');
  };

  // 8 menus grid data
  const menus = [
    {
      id: 'courts',
      title: 'Xem trạng thái sân',
      icon: <Layout size={24} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
      path: venue ? `/owner/venues/${venue.id}` : '/owner/venues',
    },
    {
      id: 'pos',
      title: 'Bán hàng',
      icon: <ShoppingCart size={24} />,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
      path: '/owner/pos',
    },
    {
      id: 'inventory',
      title: 'Kho & dịch vụ',
      icon: <Package size={24} />,
      gradient: 'linear-gradient(135deg, #a855f7 0%, #f43f5e 100%)',
      path: '/owner/inventory',
    },
    {
      id: 'analytics',
      title: 'Doanh thu & lợi nhuận',
      icon: <TrendingUp size={24} />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
      path: '/owner/analytics',
    },
    {
      id: 'branch',
      title: 'Quản lý chi nhánh',
      icon: <Layers size={24} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
      path: venue ? `/owner/venues/${venue.id}?tab=profile` : '/owner/venues',
    },
    {
      id: 'customers',
      title: 'Quản lý khách hàng',
      icon: <Users size={24} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      path: '/owner/customers',
    },
    {
      id: 'vouchers',
      title: 'Quản lý voucher',
      icon: <Ticket size={24} />,
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%)',
      path: '/owner/vouchers',
    },
    {
      id: 'monthly',
      title: 'Quản lý đơn tháng',
      icon: <Calendar size={24} />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
      path: '/owner/monthly-bookings',
    },
  ];

  return (
    <OwnerLayout showSystemHeader={false}>
      <div className="owner-dashboard-wrapper">
        
        {/* Dynamic Green Banner Header exactly as pictured */}
        <div className="owner-dashboard-banner">
          {/* Header Action Buttons */}
          <div className="owner-banner-header-actions">
            <button className="owner-banner-action-btn" onClick={handleGoBackToUser} title="Quay lại giao diện người dùng">
              <LogOut size={22} color="white" />
            </button>
            <button className="owner-banner-action-btn" onClick={handleScanQR} title="Quét mã QR Check-in">
              <QrCode size={22} color="white" />
            </button>
          </div>

          {/* Circle Avatar Frame */}
          <div className="owner-banner-avatar-container">
            <div className="owner-banner-avatar-frame">
              {/* Temporarily empty white circle */}
            </div>
          </div>

          {/* Venue Name */}
          <h2 className="owner-banner-venue-name">{venueName}</h2>
        </div>

        {/* Main Content White Container */}
        <div className="owner-dashboard-content-card">
          <div className="owner-dashboard-grid">
            {menus.map((m) => (
              <button
                key={m.id}
                onClick={() => navigate(m.path)}
                className="owner-dashboard-grid-item"
                style={{ background: m.gradient }}
              >
                {/* Large background watermark icon */}
                <div className="owner-grid-item-bg-icon">
                  {m.icon}
                </div>

                {/* Background Pattern effect */}
                <div className="owner-grid-item-pattern"></div>
                
                {/* Content */}
                <div className="owner-grid-item-content">
                  <div className="owner-grid-item-icon-wrapper">
                    {m.icon}
                  </div>
                  <span className="owner-grid-item-title">{m.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {showExitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 24,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: '24px 20px',
            width: '100%',
            maxWidth: 320,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <h3 style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: '#064e3b',
            }}>
              Đăng xuất
            </h3>
            
            <p style={{
              margin: 0,
              fontSize: 13.5,
              color: '#64748b',
              lineHeight: 1.45,
            }}>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 8,
            }}>
              <button 
                onClick={() => setShowExitModal(false)}
                style={{
                  padding: '11px 0',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                Hủy
              </button>
              
              <button 
                onClick={() => {
                  setShowExitModal(false);
                  navigate('/');
                }}
                style={{
                  padding: '11px 0',
                  border: 'none',
                  borderRadius: 12,
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
