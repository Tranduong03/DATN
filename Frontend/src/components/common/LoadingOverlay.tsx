import './LoadingOverlay.css';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
}

export default function LoadingOverlay({ isLoading, text = 'Đang xử lý...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="spinner-container">
        <div className="multi-spinner">
          <div className="spinner-circle spinner-circle-outer"></div>
          <div className="spinner-circle spinner-circle-inner"></div>
        </div>
        <div className="loading-text">
          {text}
          <span className="dot-1">.</span>
          <span className="dot-2">.</span>
          <span className="dot-3">.</span>
        </div>
      </div>
    </div>
  );
}
