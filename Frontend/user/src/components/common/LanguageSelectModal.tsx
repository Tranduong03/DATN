import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './LanguageSelectModal.css';

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
      className="lang-modal-overlay"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="lang-modal-box"
      >
        {/* Vietnamese Option */}
        <button
          onClick={() => handleLanguageChange('vi')}
          className="lang-modal-btn"
        >
          <span className="lang-modal-code">VN</span>
          <span className="lang-modal-name">Tiếng Việt</span>
        </button>

        {/* Divider */}
        <div className="lang-modal-divider" />

        {/* English Option */}
        <button
          onClick={() => handleLanguageChange('en')}
          className="lang-modal-btn"
        >
          <span className="lang-modal-code">GB</span>
          <span className="lang-modal-name">English</span>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
export type { LanguageSelectModalProps };
