import { ChevronRight, BellRing, Globe, RectangleEllipsis, LogOut, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SubPageHeader from '../../components/common/SubPageHeader';
import { useTranslation } from 'react-i18next';
import LanguageSelectModal from '../../components/common/LanguageSelectModal';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/account');
  };

  return (
    <div className="settings-page-wrapper">
      <SubPageHeader title={t('settings.title', 'Cài đặt')} />

      <div className="settings-content">
        <div className="settings-menu-item">
          <div className="settings-menu-icon-container">
            <BellRing size={18} className="settings-icon" />
          </div>
          <span className="settings-menu-text">{t('settings.notifications', 'Cài đặt thông báo')}</span>
          <ChevronRight className="settings-chevron" size={16} strokeWidth={1.5} />
        </div>

        <div className="settings-menu-item" onClick={() => setIsLangModalOpen(true)} style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <Globe size={18} className="settings-icon" />
          </div>
          <span className="settings-menu-text">
            {i18n.language.startsWith('vi') ? 'Ngôn ngữ - Tiếng Việt' : 'Language - English'}
          </span>
          <ChevronRight className="settings-chevron" size={16} strokeWidth={1.5} />
        </div>

        <div className="settings-menu-item" onClick={() => navigate('/settings/change-password')} style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <RectangleEllipsis size={18} className="settings-icon" />
          </div>
          <span className="settings-menu-text">{t('settings.changePassword', 'Đổi mật khẩu')}</span>
          <ChevronRight className="settings-chevron" size={16} strokeWidth={1.5} />
        </div>

        <div className="settings-menu-item" onClick={() => setIsLogoutPopupOpen(true)} style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <LogOut size={18} className="settings-icon" />
          </div>
          <span className="settings-menu-text">{t('settings.logout', 'Đăng xuất tài khoản')}</span>
          <ChevronRight className="settings-chevron" size={16} strokeWidth={1.5} />
        </div>

        <div className="settings-menu-item" onClick={() => navigate('/owner/onboarding')} style={{ cursor: 'pointer' }}>
          <div className="settings-menu-icon-container">
            <ArrowRightLeft size={18} style={{ color: '#d97706' }} />
          </div>
          <span className="settings-menu-text" style={{ color: '#d97706', fontWeight: 600 }}>{t('settings.forOwners', 'Dành cho Chủ sân')}</span>
          <ChevronRight size={16} strokeWidth={1.5} style={{ color: '#d97706' }} />
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      {isLogoutPopupOpen && (
        <div className="logout-popup-overlay">
          <div className="logout-popup-card">
            <h3 className="logout-popup-title">{t('settings.logoutTitle', 'Đăng xuất')}</h3>
            <p className="logout-popup-desc">{t('settings.logoutConfirm', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?')}</p>
            <div className="logout-popup-actions">
              <button 
                className="logout-btn-cancel"
                onClick={() => setIsLogoutPopupOpen(false)}
              >
                {t('common.cancel', 'Hủy')}
              </button>
              <button 
                className="logout-btn-confirm"
                onClick={handleLogout}
              >
                {t('settings.logoutAction', 'Đăng xuất')}
              </button>
            </div>
          </div>
        </div>
      )}
      <LanguageSelectModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
    </div>
  );
}
