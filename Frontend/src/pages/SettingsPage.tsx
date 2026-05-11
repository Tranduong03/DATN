import { ChevronLeft, ChevronRight, Bell, Globe, RectangleEllipsis, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/account');
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-header">
        <button className="settings-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft color="#fff" size={24} />
        </button>
        <h1 className="settings-title">Cài đặt</h1>
        <div style={{ width: 24 }}></div> {/* Placeholder for centering */}
      </div>

      <div className="settings-content">
        <div className="settings-menu-item">
          <div className="settings-menu-icon-container">
            <Bell size={20} className="settings-icon" />
          </div>
          <span className="settings-menu-text">Cài đặt thông báo</span>
          <ChevronRight className="settings-chevron" size={20} />
        </div>

        <div className="settings-menu-item">
          <div className="settings-menu-icon-container">
            <Globe size={20} className="settings-icon" />
          </div>
          <span className="settings-menu-text">Ngôn ngữ - Tiếng Việt</span>
          <ChevronRight className="settings-chevron" size={20} />
        </div>

        <div className="settings-menu-item">
          <div className="settings-menu-icon-container">
            <RectangleEllipsis size={20} className="settings-icon" />
          </div>
          <span className="settings-menu-text">Đổi mật khẩu</span>
          <ChevronRight className="settings-chevron" size={20} />
        </div>

        <div className="settings-menu-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <LogOut size={20} className="settings-icon" />
          </div>
          <span className="settings-menu-text">Đăng xuất tài khoản</span>
          <ChevronRight className="settings-chevron" size={20} />
        </div>

        <div className="settings-menu-item delete-account" style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <Trash2 size={20} className="settings-icon-danger" />
          </div>
          <span className="settings-menu-text-danger">Xóa tài khoản</span>
          <ChevronRight className="settings-chevron-danger" size={20} />
        </div>
      </div>
    </div>
  );
}
