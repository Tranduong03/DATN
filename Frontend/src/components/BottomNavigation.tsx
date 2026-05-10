import { Home, MapPin, Newspaper, Flame, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isActive('/')}`}>
        <Home size={20} />
        <span>Trang chủ</span>
      </Link>
      
      <Link to="/map" className={`nav-item ${isActive('/map')}`}>
        <MapPin size={20} />
        <span>Bản đồ</span>
      </Link>
      
      <div className="nav-fab-container">
        <div className="nav-fab-bg"></div>
        <Link to="/explore" className="nav-fab">
          <Newspaper size={24} />
        </Link>
        {/* We add a small label below the fab manually or absolute positioned if needed. 
            The design has "Khám phá" text below the circle. 
            Let's add it below the container using absolute positioning. */}
        <span style={{ position: 'absolute', bottom: '-15px', fontSize: '11px', color: '#999', fontWeight: 500, whiteSpace: 'nowrap' }}>
          Khám phá
        </span>
      </div>
      
      <Link to="/trending" className={`nav-item ${isActive('/trending')}`}>
        <Flame size={20} />
        <span>Nổi bật</span>
      </Link>
      
      <Link to="/account" className={`nav-item ${isActive('/account')}`}>
        <User size={20} />
        <span>Tài khoản</span>
      </Link>
    </nav>
  );
}
