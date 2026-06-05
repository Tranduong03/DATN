import { Home, MapPin, Newspaper, Flame, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavigation() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const accountPath = token ? '/me' : '/account';

  const isActive = (path: string) => {
    if (path === '/account' && (location.pathname === '/account' || location.pathname === '/me')) {
      return 'active';
    }
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isActive('/')}`}>
        <Home size={24} />
        <span>Trang chủ</span>
      </Link>
      
      <Link to="/map" className={`nav-item ${isActive('/map')}`}>
        <MapPin size={24} />
        <span>Bản đồ</span>
      </Link>
      
      <Link to="/explore" className={`nav-item ${isActive('/explore')}`}>
        <div style={{ height: '24px', width: '24px' }}></div>
        <span>Khám phá</span>
        
        <div className="nav-fab-bg"></div>
        <div className="nav-fab">
          <Newspaper size={36} color="var(--primary-color)" />
        </div>
      </Link>
      
      <Link to="/matches" className={`nav-item ${isActive('/matches')}`}>
        <Flame size={24} />
        <span>Kèo đấu</span>
      </Link>
      
      <Link to={accountPath} className={`nav-item ${isActive('/account')}`}>
        <User size={24} />
        <span>Tài khoản</span>
      </Link>
    </nav>
  );
}
