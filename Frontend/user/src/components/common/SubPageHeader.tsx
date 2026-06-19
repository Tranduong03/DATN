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
    <div className="settings-header">
      <button className="settings-back-btn" onClick={handleBack}>
        <ChevronLeft color="#fff" size={24} />
      </button>
      <h1 className="settings-title">{title}</h1>
      <div className="settings-placeholder"></div>
    </div>
  );
}
export type { SubPageHeaderProps };
