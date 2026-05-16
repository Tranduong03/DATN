import { ChevronLeft, ChevronRight, BellRing, Globe, RectangleEllipsis, LogOut, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);

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
            <BellRing size={18} className="settings-icon" />
          </div>
          <span className="settings-menu-text">Cài đặt thông báo</span>
          <ChevronRight className="settings-chevron" size={16} strokeWidth={1.5} />
        </div>

        <div className="settings-menu-item">
          <div className="settings-menu-icon-container">
            <Globe size={18} className="settings-icon" />
          </div>
          <span className="settings-menu-text">Ngôn ngữ - Tiếng Việt</span>
          <ChevronRight className="settings-chevron" size={16} strokeWidth={1.5} />
        </div>

        <div className="settings-menu-item" onClick={() => navigate('/settings/change-password')} style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <RectangleEllipsis size={18} className="settings-icon" />
          </div>
          <span className="settings-menu-text">Đổi mật khẩu</span>
          <ChevronRight className="settings-chevron" size={16} strokeWidth={1.5} />
        </div>

        <div className="settings-menu-item" onClick={() => setIsLogoutPopupOpen(true)} style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <LogOut size={18} className="settings-icon" />
          </div>
          <span className="settings-menu-text">Đăng xuất tài khoản</span>
          <ChevronRight className="settings-chevron" size={16} strokeWidth={1.5} />
        </div>

        <div className="settings-menu-item" onClick={() => navigate('/owner/onboarding')} style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <ArrowRightLeft size={18} style={{ color: '#d97706' }} />
          </div>
          <span className="settings-menu-text" style={{ color: '#d97706', fontWeight: 600 }}>Dành cho Chủ sân</span>
          <ChevronRight size={16} strokeWidth={1.5} style={{ color: '#d97706' }} />
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      {isLogoutPopupOpen && (
        <div className="logout-popup-overlay">
          <div className="logout-popup-card">
            <h3 className="logout-popup-title">Đăng xuất</h3>
            <p className="logout-popup-desc">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
            <div className="logout-popup-actions">
              <button 
                className="logout-btn-cancel"
                onClick={() => setIsLogoutPopupOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="logout-btn-confirm"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
