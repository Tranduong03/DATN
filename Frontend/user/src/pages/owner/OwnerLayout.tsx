import { useNavigate } from 'react-router-dom';
import BottomNavOwner from '../../components/layout/BottomNavOwner';

interface OwnerLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showSystemHeader?: boolean;
  showBottomNav?: boolean;
}

export default function OwnerLayout({ children, title, showSystemHeader = true, showBottomNav = true }: OwnerLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="owner-mobile-container">
      {/* Page Header (only shown if title exists and header is enabled) */}
      {showSystemHeader && title && (
        <header className="owner-mobile-header">
          <button className="owner-header-back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="owner-header-title">{title}</span>
          <div style={{ width: 36 }}></div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="owner-mobile-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavOwner />}
    </div>
  );
}
