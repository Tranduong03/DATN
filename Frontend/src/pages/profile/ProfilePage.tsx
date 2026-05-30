import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { MapPin, Clock, Users, Star, ChevronRight, Building2, Settings, Shield, Edit3, Calendar, Award } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { useMyVenues } from '../../hooks/queries/useOwnerQueries';
import { useOnboardingStatus } from '../../hooks/queries/useOwnerQueries';

interface JwtPayload {
  sub: string;
  email: string;
  unique_name: string;
  FullName: string;
  AvatarUrl: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string | string[];
  exp: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  roles: string[];
}

const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(id: string) {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

// ─────────────────────────────────────────────
// Default User Profile Section
// ─────────────────────────────────────────────
function DefaultProfile({ user }: { user: UserInfo }) {
  const quickLinks = [
    { icon: <Calendar size={20} />, label: 'Lịch đã đặt', to: '/me/bookings', color: '#6366f1' },
    { icon: <Star size={20} />, label: 'Đánh giá của tôi', to: '/me/reviews', color: '#f59e0b' },
    { icon: <Award size={20} />, label: 'Hạng thành viên', to: '/me/membership', color: '#10b981' },
  ];

  return (
    <>
      {/* Stats */}
      <div className="profile-stats-row">
        <div className="profile-stat">
          <span className="profile-stat-value">0</span>
          <span className="profile-stat-label">Lần đặt sân</span>
        </div>
        <div className="profile-stat-divider" />
        <div className="profile-stat">
          <span className="profile-stat-value">5.0</span>
          <span className="profile-stat-label">Điểm tin cậy</span>
        </div>
        <div className="profile-stat-divider" />
        <div className="profile-stat">
          <span className="profile-stat-value">0</span>
          <span className="profile-stat-label">Đánh giá</span>
        </div>
      </div>

      {/* Quick links */}
      <div className="profile-section">
        <h3 className="profile-section-title">Hoạt động</h3>
        <div className="profile-menu-list">
          {quickLinks.map(item => (
            <Link key={item.to} to={item.to} className="profile-menu-item">
              <span className="profile-menu-icon" style={{ background: item.color + '20', color: item.color }}>
                {item.icon}
              </span>
              <span className="profile-menu-label">{item.label}</span>
              <ChevronRight size={18} className="profile-menu-chevron" />
            </Link>
          ))}
        </div>
      </div>

      {/* Account info */}
      <div className="profile-section">
        <h3 className="profile-section-title">Thông tin tài khoản</h3>
        <div className="profile-info-card">
          <div className="profile-info-row">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user.email}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Tên đăng nhập</span>
            <span className="profile-info-value">@{user.username}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Vai trò</span>
            <span className="profile-info-value">
              <span className="profile-role-badge profile-role-badge--default">Người dùng</span>
            </span>
          </div>
        </div>
      </div>

      {/* Become Owner CTA */}
      <div className="profile-cta-card">
        <div className="profile-cta-icon">🏟️</div>
        <div className="profile-cta-body">
          <div className="profile-cta-title">Bạn có sân thể thao?</div>
          <div className="profile-cta-desc">Đăng ký trở thành chủ sân để quản lý lịch đặt và tăng doanh thu.</div>
        </div>
        <Link to="/owner/onboarding" className="profile-cta-btn">Đăng ký ngay</Link>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Owner Profile Section
// ─────────────────────────────────────────────
function OwnerProfile({ user }: { user: UserInfo }) {
  const { data: venues = [], isLoading: loadingVenues } = useMyVenues();
  const { data: onboarding } = useOnboardingStatus();

  const activeVenues = (venues as any[]).filter(v => v.status === 'ACTIVE');
  const pendingVenues = (venues as any[]).filter(v => v.status === 'PENDING_APPROVAL');

  return (
    <>
      {/* Stats row */}
      <div className="profile-stats-row">
        <div className="profile-stat">
          <span className="profile-stat-value">{activeVenues.length}</span>
          <span className="profile-stat-label">Sân đang hoạt động</span>
        </div>
        <div className="profile-stat-divider" />
        <div className="profile-stat">
          <span className="profile-stat-value">{pendingVenues.length}</span>
          <span className="profile-stat-label">Đang chờ duyệt</span>
        </div>
        <div className="profile-stat-divider" />
        <div className="profile-stat">
          <span className="profile-stat-value">0</span>
          <span className="profile-stat-label">Đặt sân hôm nay</span>
        </div>
      </div>

      {/* Verification status */}
      {onboarding && (
        <div className={`profile-verify-banner ${onboarding.verificationStatus === 'Verified' ? 'verified' : onboarding.verificationStatus === 'Pending' ? 'pending' : 'default'}`}>
          <div className="profile-verify-icon">
            {onboarding.verificationStatus === 'Verified' ? '✅' : onboarding.verificationStatus === 'Pending' ? '⏳' : '📋'}
          </div>
          <div>
            <div className="profile-verify-title">
              {onboarding.verificationStatus === 'Verified' ? 'Tài khoản đã được xác minh' :
               onboarding.verificationStatus === 'Pending' ? 'Đang chờ admin duyệt' :
               'Chưa hoàn thành đăng ký'}
            </div>
            <div className="profile-verify-sub">
              {onboarding.verificationStatus === 'Verified' ? 'Sân của bạn đang hiển thị công khai' :
               onboarding.verificationStatus === 'Pending' ? 'Thường mất 1-2 ngày làm việc' :
               'Hoàn thành để bắt đầu nhận đặt lịch'}
            </div>
          </div>
        </div>
      )}

      {/* My Venues */}
      <div className="profile-section">
        <div className="profile-section-header">
          <h3 className="profile-section-title">Sân của tôi</h3>
          <Link to="/owner/venues" className="profile-section-link">Xem tất cả</Link>
        </div>

        {loadingVenues ? (
          <div className="profile-venues-skeleton">
            {[1, 2].map(i => <div key={i} className="profile-venue-skeleton-item" />)}
          </div>
        ) : (venues as any[]).length === 0 ? (
          <div className="profile-empty-venues">
            <span>🏟️</span>
            <p>Chưa có sân nào. <Link to="/owner/onboarding">Đăng ký sân ngay</Link></p>
          </div>
        ) : (
          <div className="profile-venue-list">
            {(venues as any[]).slice(0, 3).map((venue: any) => (
              <Link to={`/owner/venues/${venue.id}`} key={venue.id} className="profile-venue-card">
                <div className="profile-venue-icon">
                  <Building2 size={22} />
                </div>
                <div className="profile-venue-info">
                  <div className="profile-venue-name">{venue.name}</div>
                  <div className="profile-venue-meta">
                    <span><MapPin size={13} /> {venue.address}</span>
                    <span><Clock size={13} /> {venue.operatingStartHour} – {venue.operatingEndHour}</span>
                  </div>
                  <div className="profile-venue-meta">
                    <span><Users size={13} /> {venue.venueScale} sân con</span>
                  </div>
                </div>
                <div className="profile-venue-right">
                  <span className={`profile-venue-status ${venue.status === 'ACTIVE' ? 'active' : venue.status === 'PENDING_APPROVAL' ? 'pending' : 'rejected'}`}>
                    {venue.status === 'ACTIVE' ? 'Hoạt động' : venue.status === 'PENDING_APPROVAL' ? 'Đang duyệt' : 'Từ chối'}
                  </span>
                  <ChevronRight size={16} className="profile-menu-chevron" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="profile-section">
        <h3 className="profile-section-title">Thông tin tài khoản</h3>
        <div className="profile-info-card">
          <div className="profile-info-row">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user.email}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Tên đăng nhập</span>
            <span className="profile-info-value">@{user.username}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Vai trò</span>
            <span className="profile-info-value">
              <span className="profile-role-badge profile-role-badge--owner">Chủ sân</span>
            </span>
          </div>
        </div>
      </div>

      {/* Owner quick links */}
      <div className="profile-section">
        <h3 className="profile-section-title">Quản lý</h3>
        <div className="profile-menu-list">
          <Link to="/owner" className="profile-menu-item">
            <span className="profile-menu-icon" style={{ background: '#6366f120', color: '#6366f1' }}><Building2 size={20} /></span>
            <span className="profile-menu-label">Dashboard chủ sân</span>
            <ChevronRight size={18} className="profile-menu-chevron" />
          </Link>
          <Link to="/owner/venues" className="profile-menu-item">
            <span className="profile-menu-icon" style={{ background: '#10b98120', color: '#10b981' }}><Settings size={20} /></span>
            <span className="profile-menu-label">Cấu hình sân & giá</span>
            <ChevronRight size={18} className="profile-menu-chevron" />
          </Link>
          <Link to="/me/bookings" className="profile-menu-item">
            <span className="profile-menu-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}><Calendar size={20} /></span>
            <span className="profile-menu-label">Lịch đặt của tôi</span>
            <ChevronRight size={18} className="profile-menu-chevron" />
          </Link>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Main ProfilePage
// ─────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/account'); return; }

    // Kiểm tra token cũ có hợp lệ không trước
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) throw new Error('expired');
    } catch {
      localStorage.removeItem('token');
      navigate('/account');
      return;
    }

    // Luôn gọi refresh-token để lấy roles mới nhất từ DB
    // (tránh tình huống token cũ không có role Owner sau khi admin duyệt)
    fetch('/api/Auth/refresh-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        const freshToken = res.token || res.Token;
        if (freshToken) {
          localStorage.setItem('token', freshToken);
          return freshToken;
        }
        return token; // Fallback: dùng token cũ
      })
      .catch(() => token) // Nếu network lỗi, dùng token cũ
      .then(finalToken => {
        try {
          const decoded = jwtDecode<JwtPayload>(finalToken);
          const rawRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          const roles = Array.isArray(rawRole) ? rawRole : rawRole ? [rawRole] : ['Default'];
          setUser({
            id: decoded.sub,
            name: decoded.FullName || decoded.unique_name || 'Người dùng',
            email: decoded.email || '',
            username: decoded.unique_name || '',
            avatar: decoded.AvatarUrl || '',
            roles,
          });
        } catch {
          localStorage.removeItem('token');
          navigate('/account');
        }
      });
  }, [navigate]);

  if (!user) return null;

  const isOwner = user.roles.some(r => r === 'Owner' || r === 'owner');
  const avatarColor = getAvatarColor(user.id);
  const initials = getInitials(user.name);

  return (
    <MainLayout>
      <div className="profile-page">
        {/* Hero Header */}
        <div className="profile-hero">
          <div className="profile-hero-bg" />
          <div className="profile-hero-content">
            <div className="profile-avatar" style={{ background: user.avatar ? 'transparent' : avatarColor }}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span>{initials}</span>}
              <Link to="/settings" className="profile-avatar-edit" title="Chỉnh sửa">
                <Edit3 size={14} />
              </Link>
            </div>
            <div className="profile-hero-info">
              <h1 className="profile-hero-name">{user.name}</h1>
              <p className="profile-hero-email">{user.email}</p>
              <div className="profile-hero-badges">
                {isOwner && <span className="profile-badge profile-badge--owner"><Shield size={12} /> Chủ sân</span>}
                <span className="profile-badge profile-badge--default"><Users size={12} /> Thành viên</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="profile-body">
          {isOwner ? <OwnerProfile user={user} /> : <DefaultProfile user={user} />}

          {/* System links */}
          <div className="profile-section">
            <h3 className="profile-section-title">Hệ thống</h3>
            <div className="profile-menu-list">
              <Link to="/settings" className="profile-menu-item">
                <span className="profile-menu-icon" style={{ background: '#6b728020', color: '#6b7280' }}><Settings size={20} /></span>
                <span className="profile-menu-label">Cài đặt tài khoản</span>
                <ChevronRight size={18} className="profile-menu-chevron" />
              </Link>
              <Link to="/settings/change-password" className="profile-menu-item">
                <span className="profile-menu-icon" style={{ background: '#ef444420', color: '#ef4444' }}><Shield size={20} /></span>
                <span className="profile-menu-label">Đổi mật khẩu</span>
                <ChevronRight size={18} className="profile-menu-chevron" />
              </Link>
            </div>
          </div>

          <p className="profile-version">SportConnect v1.1.0</p>
        </div>
      </div>
    </MainLayout>
  );
}
