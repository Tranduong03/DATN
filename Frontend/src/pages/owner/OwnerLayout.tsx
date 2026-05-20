import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface OwnerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  {
    label: 'Tổng quan',
    path: '/owner',
    exact: true,
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Quản lý Sân',
    path: '/owner/venues',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function OwnerLayout({ children, title, subtitle }: OwnerLayoutProps) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGoToCustomerView = () => {
    navigate('/me');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar - reusing admin styles for consistency */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="admin-logo-text">
              <span className="admin-logo-brand">SportConnect</span>
              <span className="admin-logo-sub">Owner Panel</span>
            </div>
          )}
          <button
            className="admin-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sidebarCollapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              }
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {!sidebarCollapsed && <span className="admin-nav-section-label">QUẢN LÝ</span>}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="admin-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item admin-logout-btn" onClick={handleGoToCustomerView} style={{ color: '#4f46e5' }} title={sidebarCollapsed ? 'Chế độ người dùng' : undefined}>
            <span className="admin-nav-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </span>
            {!sidebarCollapsed && <span className="admin-nav-label">Chế độ Khách hàng</span>}
          </button>

          <button className="admin-nav-item admin-logout-btn" onClick={handleLogout} title={sidebarCollapsed ? 'Đăng xuất' : undefined}>
            <span className="admin-nav-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            {!sidebarCollapsed && <span className="admin-nav-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-page-title">{title}</h1>
            {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
          </div>
          <div className="admin-header-right">
            <div className="admin-header-user">
              <div className="admin-header-avatar" style={{ backgroundColor: '#f59e0b' }}>O</div>
              <span className="admin-header-username">Chủ sân</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
