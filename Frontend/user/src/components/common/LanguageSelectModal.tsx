import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageSelectModal({ isOpen, onClose }: LanguageSelectModalProps) {
  const { i18n } = useTranslation();

  if (!isOpen) return null;

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    onClose();
  };

  const modalContent = (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '320px',
          backgroundColor: '#eeeeee',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #cccccc'
        }}
      >
        {/* Vietnamese Option */}
        <button
          onClick={() => handleLanguageChange('vi')}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#ffffff',
            border: 'none',
            outline: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f8e9')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <span style={{ color: '#064e3b', fontWeight: '500' }}>VN</span>
          <span style={{ color: '#064e3b', fontWeight: '700' }}>Tiếng Việt</span>
        </button>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#e0e0e0' }} />

        {/* English Option */}
        <button
          onClick={() => handleLanguageChange('en')}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#ffffff',
            border: 'none',
            outline: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f8e9')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <span style={{ color: '#064e3b', fontWeight: '500' }}>GB</span>
          <span style={{ color: '#064e3b', fontWeight: '700' }}>English</span>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
