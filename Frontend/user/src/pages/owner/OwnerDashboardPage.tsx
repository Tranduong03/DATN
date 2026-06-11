import { useNavigate } from 'react-router-dom';
import OwnerLayout from './OwnerLayout';
import { useMyVenues } from '../../hooks/queries/useOwnerQueries';
import { Layout, ShoppingCart, Package, TrendingUp, Layers, Users, Ticket, Calendar, LogOut, QrCode } from 'lucide-react';
import defaultOwnerAvatar from '../../assets/images/owner-default.webp';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const { data: venues } = useMyVenues();

  // Determine venue name and avatar
  const venue = venues && venues.length > 0 ? venues[0] : null;
  const venueName = venue?.name || 'Sân thể thao Sport Connect';
  


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
      path: venue ? `/owner/venues/${venue.id}/edit` : '/owner/venues',
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
      title: 'Quản lý sân',
      icon: <Layers size={24} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
      path: venue ? `/owner/venues/${venue.id}` : '/owner/venues',
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="owner-banner-action-btn" title="Quay lại giao diện người dùng">
                  <LogOut size={22} color="white" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Đăng xuất</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={() => navigate('/me')}>Đăng xuất</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <button className="owner-banner-action-btn" onClick={handleScanQR} title="Quét mã QR Check-in">
              <QrCode size={22} color="white" />
            </button>
          </div>

          {/* Circle Avatar Frame */}
          <div className="owner-banner-avatar-container">
            <div className="owner-banner-avatar-frame">
              <img src={defaultOwnerAvatar} alt="Owner Avatar" className="owner-banner-avatar-img" />
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


    </OwnerLayout>
  );
}
