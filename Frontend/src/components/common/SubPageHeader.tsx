import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubPageHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function SubPageHeader({ title, onBack }: SubPageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="settings-header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
      <button className="settings-back-btn" onClick={handleBack}>
        <ChevronLeft color="#fff" size={24} />
      </button>
      <h1 className="settings-title">{title}</h1>
      <div style={{ width: 24 }}></div> {/* Placeholder for centering */}
    </div>
  );
}
