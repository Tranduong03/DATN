import { ChevronRight, CalendarDays, Info, ShieldCheck, Sparkles, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

export default function AccountPage() {
  return (
    <MainLayout>
      <div className="account-page">
        {/* Header background */}
        <div className="account-header"></div>

        {/* Profile Card */}
        <div className="profile-card">
          <img src="/SportConnect.jpg" alt="Logo" className="profile-logo" />
          <div className="profile-info">
            <h2 className="profile-title">Sport Connect - Hệ Thống Kết Nối <br />Thể Thao</h2>
            <p className="profile-subtitle">Tạo tài khoản để nhận nhiều ưu đãi hơn</p>
            <div className="profile-actions">
              <Link to="/login" className="btn-login">Đăng nhập</Link>
              <Link to="/register" className="btn-register">Đăng kí</Link>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="menu-section">
          <h3 className="menu-section-title">Hoạt động</h3>
          <div className="menu-list">
            <Link to="/bookings" className="menu-item">
              <div className="menu-icon">
                <CalendarDays size={20} />
              </div>
              <span className="menu-text">Danh sách lịch đã đặt</span>
              <ChevronRight className="menu-chevron" size={20} />
            </Link>
          </div>
        </div>

        <div className="menu-section">
          <h3 className="menu-section-title">Hệ thống</h3>
          <div className="menu-list">
            <Link to="/version" className="menu-item">
              <div className="menu-icon">
                <Info size={20} />
              </div>
              <span className="menu-text">Thông tin phiên bản: 1.1.0</span>
              <ChevronRight className="menu-chevron" size={20} />
            </Link>
            <Link to="/terms" className="menu-item">
              <div className="menu-icon">
                <ShieldCheck size={20} />
              </div>
              <span className="menu-text">Điều khoản và chính sách</span>
              <ChevronRight className="menu-chevron" size={20} />
            </Link>
            <Link to="/whats-new" className="menu-item">
              <div className="menu-icon">
                <Sparkles size={20} />
              </div>
              <span className="menu-text">Ứng dụng có gì mới</span>
              <ChevronRight className="menu-chevron" size={20} />
            </Link>
            <Link to="/language" className="menu-item">
              <div className="menu-icon">
                <Languages size={20} />
              </div>
              <span className="menu-text">Ngôn ngữ - Tiếng Việt</span>
              <ChevronRight className="menu-chevron" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
