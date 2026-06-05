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

  return (
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
        zIndex: 1000,
        padding: '24px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '320px',
          backgroundColor: '#e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Vietnamese Option */}
        <button
          onClick={() => handleLanguageChange('vi')}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#eeeeee',
            border: 'none',
            outline: 'none',
            fontSize: '18px',
            fontWeight: '600',
            color: '#064e3b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#eeeeee')}
        >
          <span style={{ fontSize: '20px' }}>🇻🇳</span>
          <span>Tiếng Việt</span>
        </button>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#d1d5db' }} />

        {/* English Option */}
        <button
          onClick={() => handleLanguageChange('en')}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#eeeeee',
            border: 'none',
            outline: 'none',
            fontSize: '18px',
            fontWeight: '600',
            color: '#064e3b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#eeeeee')}
        >
          <span style={{ fontSize: '20px' }}>🇬🇧</span>
          <span>English</span>
        </button>
      </div>
    </div>
  );
}
