import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  ArrowLeft, Camera, Mail, Calendar, Edit2, Trophy, 
  Activity, Plus, ShieldCheck, MapPin, ChevronRight, Check,
  Award, Phone, Cake, Mars, Venus
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

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
  phone: string;
  dob: string;
  gender: string;
  roles: string[];
}

const CourtLinesPattern = () => (
  <svg className="court-lines-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
    <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
    <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
    <circle cx="50" cy="5" r="1" fill="rgba(255,255,255,0.12)" />
    <circle cx="50" cy="95" r="1" fill="rgba(255,255,255,0.12)" />
    <path d="M 35 5 A 15 15 0 0 0 65 5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
    <path d="M 35 95 A 15 15 0 0 1 65 95" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
  </svg>
);

const BrandLogo = () => (
  <div className="brand-logo-container">
    <svg className="brand-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
    <span className="brand-logo-text">SPORTCONNECT</span>
  </div>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'links'>('overview');

  // Interactive profile states
  const [name, setName] = useState('Phi Duong');
  const [email, setEmail] = useState('phiduong.connect@email.com');
  const [phone, setPhone] = useState('0348102328');
  const [birthYear, setBirthYear] = useState('2026');
  const [gender, setGender] = useState('Chọn giới tính');
  
  // Overview Tab states
  const [height, setHeight] = useState(182);
  const [weight, setWeight] = useState(78);
  const [specialNotes, setSpecialNotes] = useState('Chấn thương cổ chân trái');
  
  const [favPosition, setFavPosition] = useState('Bên phải, trung tâm');
  const [sportsLevel, setSportsLevel] = useState('Bóng đá: Advanced, Bóng rổ: Intermediate');
  const [goals, setGoals] = useState('Tăng thể lực, cải thiện dứt điểm');
  const [frequency, setFrequency] = useState('4-5 lần/tuần');

  // Editing toggle states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPhysical, setIsEditingPhysical] = useState(false);
  const [isEditingPersonalization, setIsEditingPersonalization] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/account');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('expired');
      }
    } catch {
      localStorage.removeItem('token');
      navigate('/account');
      return;
    }

    // Call refresh-token to ensure latest state
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
        return token;
      })
      .catch(() => token)
      .then(finalToken => {
        try {
          const decoded = jwtDecode<JwtPayload>(finalToken);
          const rawRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          const roles = Array.isArray(rawRole) ? rawRole : rawRole ? [rawRole] : ['Default'];
          
          setUser({
            id: decoded.sub,
            name: decoded.FullName || decoded.unique_name || 'Phi Duong',
            email: decoded.email || 'phiduong.connect@email.com',
            username: decoded.unique_name || 'phi.duong',
            avatar: decoded.AvatarUrl || '',
            phone: '0348102328',
            dob: '15/05/2026',
            gender: 'Nam',
            roles,
          });

          // Sync database claims with editable states
          setName(decoded.FullName || decoded.unique_name || 'Phi Duong');
          setEmail(decoded.email || 'phiduong.connect@email.com');
        } catch {
          localStorage.removeItem('token');
          navigate('/account');
        }
      });
  }, [navigate]);

  if (!user) return null;

  const isOwner = user.roles.some(r => r === 'Owner' || r === 'owner');

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    // Logic to update backend can be integrated here
  };

  return (
    <MainLayout>
      <div className="profile-container">
        
        {/* Banner Area */}
        <div className="profile-banner-area">
          <div className="profile-banner-gradient" />
          <CourtLinesPattern />
          
          {/* Header Actions */}
          <div className="profile-banner-header">
            <button className="banner-action-btn back-btn" onClick={() => navigate(-1)} aria-label="Quay lại">
              <ArrowLeft size={20} />
            </button>
            <BrandLogo />
            <button className="banner-action-btn camera-btn" aria-label="Đổi ảnh bìa">
              <Camera size={20} />
            </button>
          </div>
        </div>

        {/* Profile Card Overlay */}
        <div className="profile-card-container">
          <div className="profile-card-glass">
            
            {/* Avatar Section */}
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-inner">
                {user.avatar ? (
                  <img src={user.avatar} alt={name} className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button className="profile-avatar-edit-btn" aria-label="Sửa ảnh đại diện">
                  <Camera size={12} />
                </button>
              </div>
            </div>

            {/* Username and Email */}
            <div className="profile-identity">
              {isEditingProfile ? (
                <div className="profile-inline-edit-group">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="profile-edit-input"
                  />
                  <button onClick={handleSaveProfile} className="profile-save-badge-btn">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="profile-name-row">
                  <h2 className="profile-display-name">{name}</h2>
                  <button onClick={() => setIsEditingProfile(true)} className="profile-edit-trigger" aria-label="Sửa tên">
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
              
              <div className="profile-email-badge">
                <Mail size={12} className="profile-email-icon" />
                <span className="profile-email-text">{email}</span>
              </div>
            </div>

            {/* 3-Column Information Row */}
            <div className="profile-info-row-cols">
              <div className="profile-info-col">
                <div className="info-col-header">
                  <Phone size={14} className="info-col-icon" />
                  <span className="info-col-label">Điện thoại</span>
                </div>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="info-col-input"
                  />
                ) : (
                  <span className="info-col-value">{phone}</span>
                )}
              </div>

              <div className="profile-info-col">
                <div className="info-col-header">
                  <Cake size={14} className="info-col-icon" />
                  <span className="info-col-label">Năm sinh</span>
                </div>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={birthYear} 
                    onChange={(e) => setBirthYear(e.target.value)} 
                    className="info-col-input"
                  />
                ) : (
                  <span className="info-col-value">{birthYear}</span>
                )}
              </div>

              <div className="profile-info-col">
                <div className="info-col-header">
                  {gender === 'Nữ' ? <Venus size={14} className="info-col-icon" /> : <Mars size={14} className="info-col-icon" />}
                  <span className="info-col-label">Giới tính</span>
                </div>
                {isEditingProfile ? (
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)} 
                    className="info-col-select"
                  >
                    <option value="Chọn giới tính">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <span className="info-col-value">{gender}</span>
                )}
              </div>
            </div>

            {/* Quick Action to save Profile details if editing */}
            {isEditingProfile && (
              <button onClick={handleSaveProfile} className="profile-save-all-btn">
                Lưu thông tin liên hệ
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs-nav">
          <button 
            className={`profile-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Tổng quan
          </button>
          <button 
            className={`profile-tab-button ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            Liên kết
          </button>
        </div>

        {/* Tab Contents */}
        <div className="profile-tab-body">
          {activeTab === 'overview' ? (
            <div className="overview-tab-content">
              
              {/* Module 1: THÔNG TIN THỂ CHẤT */}
              <div className="overview-section-card">
                <div className="section-card-header">
                  <h3 className="section-card-title">THÔNG TIN THỂ CHẤT</h3>
                  <button 
                    onClick={() => setIsEditingPhysical(!isEditingPhysical)} 
                    className={`section-edit-btn ${isEditingPhysical ? 'active' : ''}`}
                    aria-label="Sửa thông tin thể chất"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>

                <div className="physical-stats-grid">
                  <div className="physical-stat-cell">
                    <div className="stat-cell-header">
                      <span className="stat-label">Chiều cao (cm)</span>
                      <span className="stat-number">{height}</span>
                    </div>
                    {isEditingPhysical ? (
                      <input 
                        type="range" 
                        min="130" 
                        max="220" 
                        value={height} 
                        onChange={(e) => setHeight(Number(e.target.value))} 
                        className="stat-slider"
                      />
                    ) : (
                      <div className="stat-slider-track">
                        <div className="stat-slider-fill" style={{ width: `${((height - 130) / 90) * 100}%` }} />
                      </div>
                    )}
                  </div>

                  <div className="physical-stat-cell">
                    <div className="stat-cell-header">
                      <span className="stat-label">Cân nặng (kg)</span>
                      <span className="stat-number">{weight}</span>
                    </div>
                    {isEditingPhysical ? (
                      <input 
                        type="range" 
                        min="30" 
                        max="150" 
                        value={weight} 
                        onChange={(e) => setWeight(Number(e.target.value))} 
                        className="stat-slider"
                      />
                    ) : (
                      <div className="stat-slider-track">
                        <div className="stat-slider-fill" style={{ width: `${((weight - 30) / 120) * 100}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Notes box */}
                <div className="special-notes-wrapper">
                  <div className="notes-header">
                    <span className="notes-label">Ghi chú đặc biệt</span>
                    <button 
                      onClick={() => setIsEditingNotes(!isEditingNotes)} 
                      className="notes-edit-btn"
                      aria-label="Sửa ghi chú"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  {isEditingNotes ? (
                    <div className="notes-edit-container">
                      <textarea 
                        value={specialNotes} 
                        onChange={(e) => setSpecialNotes(e.target.value)} 
                        className="notes-textarea"
                      />
                      <button onClick={() => setIsEditingNotes(false)} className="notes-save-btn">
                        Xác nhận
                      </button>
                    </div>
                  ) : (
                    <div className="notes-content-box">
                      <span className="notes-text">{specialNotes || "Không có ghi chú đặc biệt"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Module 2: CÁ NHÂN HÓA */}
              <div className="overview-section-card">
                <div className="section-card-header">
                  <h3 className="section-card-title">CÁ NHÂN HÓA</h3>
                  <button 
                    onClick={() => setIsEditingPersonalization(!isEditingPersonalization)} 
                    className={`section-edit-btn ${isEditingPersonalization ? 'active' : ''}`}
                    aria-label="Sửa cá nhân hóa"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>

                <div className="personalization-grid">
                  <div className="personalization-cell">
                    <MapPin size={18} className="personal-icon" />
                    <div className="personal-content">
                      <span className="personal-label">Vị trí yêu thích</span>
                      {isEditingPersonalization ? (
                        <input 
                          type="text" 
                          value={favPosition} 
                          onChange={(e) => setFavPosition(e.target.value)} 
                          className="personal-input"
                        />
                      ) : (
                        <span className="personal-value">{favPosition}</span>
                      )}
                    </div>
                  </div>

                  <div className="personalization-cell">
                    <Activity size={18} className="personal-icon" />
                    <div className="personal-content">
                      <span className="personal-label">Thể thao & Trình độ</span>
                      {isEditingPersonalization ? (
                        <input 
                          type="text" 
                          value={sportsLevel} 
                          onChange={(e) => setSportsLevel(e.target.value)} 
                          className="personal-input"
                        />
                      ) : (
                        <span className="personal-value">{sportsLevel}</span>
                      )}
                    </div>
                  </div>

                  <div className="personalization-cell">
                    <Trophy size={18} className="personal-icon" />
                    <div className="personal-content">
                      <span className="personal-label">Mục tiêu</span>
                      {isEditingPersonalization ? (
                        <input 
                          type="text" 
                          value={goals} 
                          onChange={(e) => setGoals(e.target.value)} 
                          className="personal-input"
                        />
                      ) : (
                        <span className="personal-value">{goals}</span>
                      )}
                    </div>
                  </div>

                  <div className="personalization-cell">
                    <Calendar size={18} className="personal-icon" />
                    <div className="personal-content">
                      <span className="personal-label">Tần suất chơi</span>
                      {isEditingPersonalization ? (
                        <input 
                          type="text" 
                          value={frequency} 
                          onChange={(e) => setFrequency(e.target.value)} 
                          className="personal-input"
                        />
                      ) : (
                        <div className="personal-frequency-wrapper">
                          <span className="personal-value">{frequency}</span>
                          <div className="frequency-mini-calendar">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => {
                              const isActive = ['T2', 'T4', 'T6'].includes(day);
                              return (
                                <span key={day} className={`mini-day ${isActive ? 'active' : ''}`}>
                                  {day}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Switch to Owner Dashboard Section (If user is an Owner) */}
              {isOwner ? (
                <div className="owner-quick-access-card">
                  <div className="owner-access-body">
                    <div className="owner-title">🏟️ VAI TRÒ CHỦ SÂN</div>
                    <div className="owner-desc">Bạn đang đăng nhập với quyền chủ sân. Quản lý sân và lịch đặt của bạn.</div>
                  </div>
                  <div className="owner-buttons-row">
                    <Link to="/owner" className="owner-action-link-btn">
                      Dashboard chủ sân
                    </Link>
                    <Link to="/owner/venues" className="owner-action-link-btn outline">
                      Cấu hình sân
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="owner-quick-access-card placeholder-cta">
                  <div className="owner-access-body">
                    <div className="owner-title">Bạn có sân thể thao?</div>
                    <div className="owner-desc">Đăng ký trở thành đối tác chủ sân của SportConnect để tăng tối đa doanh thu.</div>
                  </div>
                  <Link to="/owner/onboarding" className="owner-action-link-btn">
                    Đăng ký chủ sân
                  </Link>
                </div>
              )}

              {/* Extra Account Settings links */}
              <div className="extra-settings-card">
                <h4 className="extra-settings-title">CÀI ĐẶT HỆ THỐNG</h4>
                <div className="settings-links-list">
                  <Link to="/settings" className="settings-link-item">
                    <div className="link-left">
                      <Award size={18} className="link-icon" />
                      <span>Cài đặt tài khoản</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/settings/change-password" className="settings-link-item">
                    <div className="link-left">
                      <ShieldCheck size={18} className="link-icon" />
                      <span>Đổi mật khẩu</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="links-tab-content">
              
              {/* Module: Liên kết đăng nhập */}
              <div className="connection-card">
                <h3 className="connection-section-title">Liên kết đăng nhập</h3>
                <div className="google-link-card">
                  <div className="google-link-left">
                    <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <div className="google-link-info">
                      <span className="google-title">Google</span>
                      <span className="google-status">Chưa liên kết với Google</span>
                    </div>
                  </div>
                  <button className="google-connect-btn">
                    Liên kết
                  </button>
                </div>
              </div>

              {/* Module: Tài khoản liên kết */}
              <div className="connection-card">
                <h3 className="connection-section-title">Tài khoản liên kết</h3>
                
                <button className="add-connection-btn">
                  <Plus size={16} />
                  <span>Thêm tài khoản liên kết</span>
                </button>

                <div className="empty-connections">
                  <span className="empty-desc">Chưa có tài khoản liên kết</span>
                </div>
              </div>
            </div>
          )}

          <p className="profile-version-footer">SPORTCONNECT v1.2.0</p>
        </div>
      </div>
    </MainLayout>
  );
}
