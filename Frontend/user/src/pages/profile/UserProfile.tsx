import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Camera, Calendar, Edit2, Trophy, 
  Activity, Plus, ShieldCheck, MapPin, ChevronRight, Check,
  Award, Phone, Cake, Mars, Venus
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import axiosClient from '../../api/axiosClient';

interface JwtPayload {
  sub: string;
  email?: string;
  unique_name?: string;
  FullName?: string;
  AvatarUrl?: string;
  Phone?: string;
  birthYear?: string;
  BirthYear?: string;
  Gender?: string;
  gender?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
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

// Badminton Court Lines Layout chuẩn tỷ lệ BWF (6.1m x 13.4m)
const CourtLinesPattern = () => (
  <svg className="court-lines-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1340 610" preserveAspectRatio="none">
    <defs>
      <linearGradient id="badmintonCourtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="50%" stopColor="#007028" />
        <stop offset="100%" stopColor="#39ec7e" />
      </linearGradient>
    </defs>
    <rect width="1340" height="610" fill="url(#badmintonCourtGrad)" />

    {/* Toàn bộ đường kẻ dùng chung stroke màu trắng opacity */}
    <g stroke="rgba(255,255,255,0.4)" strokeWidth="4" fill="none">
      {/* 1. Khung biên ngoài cùng (Sân đôi khi nằm ngang: 1340m x 610) */}
      <rect x="0" y="0" width="1340" height="610" strokeWidth="6" />
      
      {/* 2. Đường giữa lưới (Center net line - chia đôi chiều ngang) */}
      <line x1="670" y1="0" x2="670" y2="610" strokeWidth="8" stroke="rgba(255,255,255,0.6)" />
      
      {/* 3. Vạch giao cầu ngắn (Short service lines - cách lưới 1.98m về 2 bên) */}
      <line x1="472" y1="0" x2="472" y2="610" />
      <line x1="868" y1="0" x2="868" y2="610" />
      
      {/* 4. Vạch giao cầu dài sân đôi (Long service line for doubles - cách biên dọc trái/phải 0.76m) */}
      <line x1="76" y1="0" x2="76" y2="610" />
      <line x1="1264" y1="0" x2="1264" y2="610" />
      
      {/* 5. Đường biên dọc sân đơn (Singles side lines - cách biên ngang trên/dưới 0.46m) */}
      <line x1="0" y1="46" x2="1340" y2="46" />
      <line x1="0" y1="564" x2="1340" y2="564" />
      
      {/* 6. Đường trung tâm chia ô giao cầu Trái/Phải (Center lines) Chỉ chạy từ vạch giao cầu ngắn đến biên cuối */}
      <line x1="0" y1="305" x2="472" y2="305" />
      <line x1="868" y1="305" x2="1340" y2="305" />
    </g>
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

const tabVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'links'>('overview');
  const [direction, setDirection] = useState<number>(0);

  // Interactive profile states
  const [name, setName] = useState('Username');
  const [email, setEmail] = useState('Chưa cập nhật email');
  const [phone, setPhone] = useState('Chưa cập nhật');
  const [birthYear, setBirthYear] = useState('2026');
  const [gender, setGender] = useState('Chọn giới tính');
  
  // Overview Tab states
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(60);
  const [specialNotes, setSpecialNotes] = useState('Chưa có ghi chú đặc biệt');
  
  const [favPosition, setFavPosition] = useState('Chưa cập nhật');
  const [sportsLevel, setSportsLevel] = useState('Chưa cập nhật');
  const [goals, setGoals] = useState('Chưa cập nhật');
  const [frequency, setFrequency] = useState('Chưa cập nhật');

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
      const hasRefreshToken = !!localStorage.getItem('refreshToken');
      if (decoded.exp * 1000 < Date.now() && !hasRefreshToken) {
        throw new Error('expired');
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/account');
      return;
    }

    // Call refresh-token using axiosClient so the interceptor handles refresh automatically if needed
    axiosClient.post('/Auth/refresh-token')
      .then((res: any) => {
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
          
          const userPhone = decoded.Phone || 'Chưa cập nhật';
          const userBirthYear = decoded.BirthYear || decoded.birthYear || '2026';
          const userGender = decoded.Gender || decoded.gender || 'Chọn giới tính';

          setUser({
            id: decoded.sub,
            name: decoded.FullName || decoded.unique_name || 'Username',
            email: decoded.email || 'Chưa cập nhật email',
            username: decoded.unique_name || 'Username',
            avatar: decoded.AvatarUrl || '',
            phone: userPhone,
            dob: userBirthYear,
            gender: userGender,
            roles,
          });

          // Sync database claims with editable states
          setName(decoded.FullName || decoded.unique_name || 'Username');
          setEmail(decoded.email || 'Chưa cập nhật email');
          setPhone(userPhone);
          setBirthYear(userBirthYear);
          setGender(userGender);

          // Fetch extra profile properties from DB
          axiosClient.get('/users/profile')
            .then((res: any) => {
              if (res && res.isSuccess && res.data) {
                const data = res.data;
                if (data.height) setHeight(data.height);
                if (data.weight) setWeight(data.weight);
                if (data.specialNotes) setSpecialNotes(data.specialNotes);
                if (data.favPosition) setFavPosition(data.favPosition);
                if (data.sportsLevel) setSportsLevel(data.sportsLevel);
                if (data.goals) setGoals(data.goals);
                if (data.frequency) setFrequency(data.frequency);
              }
            })
            .catch(err => console.error("Error loading user profile:", err));
        } catch {
          localStorage.removeItem('token');
          navigate('/account');
        }
      });
  }, [navigate]);

  if (!user) return null;

  const isOwner = user.roles.some(r => r === 'Owner' || r === 'owner');

  const updateProfileOnBackend = async (fields: any) => {
    try {
      await axiosClient.put('/users/profile', fields);
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  const handleSaveProfile = async () => {
    setIsEditingProfile(false);
    await updateProfileOnBackend({
      fullName: name,
      phone: phone
    });
  };

  const handleSavePhysical = async () => {
    await updateProfileOnBackend({
      height,
      weight
    });
  };

  const handleSavePersonalization = async () => {
    await updateProfileOnBackend({
      favPosition,
      sportsLevel,
      goals,
      frequency
    });
  };

  const handleSaveNotes = async (notes: string) => {
    setSpecialNotes(notes);
    setIsEditingNotes(false);
    await updateProfileOnBackend({
      specialNotes: notes
    });
  };

  const handleTabChange = (tab: 'overview' | 'links') => {
    if (tab === activeTab) return;
    setDirection(tab === 'links' ? 1 : -1);
    setActiveTab(tab);
  };

  // BMI calculation
  const heightInMeters = height / 100;
  const bmiValue = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)) : 0;
  const bmi = bmiValue > 0 ? bmiValue.toFixed(1) : '0.0';
  
  let bmiStatus = 'Bình thường';
  let bmiClass = 'bmi-normal';
  if (bmiValue < 18.5) {
    bmiStatus = 'Gầy';
    bmiClass = 'bmi-underweight';
  } else if (bmiValue >= 18.5 && bmiValue < 25) {
    bmiStatus = 'Bình thường';
    bmiClass = 'bmi-normal';
  } else if (bmiValue >= 25 && bmiValue < 30) {
    bmiStatus = 'Thừa cân';
    bmiClass = 'bmi-overweight';
  } else if (bmiValue >= 30) {
    bmiStatus = 'Béo phì';
    bmiClass = 'bmi-obese';
  }

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
            {/* Absolute Edit Profile Button at the Top Right of the Glass Card */}
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)} 
              className={`profile-glass-edit-btn ${isEditingProfile ? 'active' : ''}`}
              aria-label="Chỉnh sửa thông tin cá nhân"
            >
              <Edit2 size={16} />
            </button>
            
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

            {/* Username and Email (Subtle matte grey badge style) */}
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
                </div>
              )}
              
              <div>
                <span className="profile-email-badge-green">
                  {email}
                </span>
              </div>
            </div>

            {/* Compact Metadata Row (3 items aligned inline) */}
            <div className="profile-quick-meta-row">
              <div className="meta-item">
                <Phone size={12} className="meta-icon" />
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="meta-input"
                  />
                ) : (
                  <span>{phone}</span>
                )}
              </div>
              <span className="meta-separator">•</span>
              <div className="meta-item">
                <Cake size={12} className="meta-icon" />
                {isEditingProfile ? (
                  <select 
                    value={birthYear} 
                    onChange={(e) => setBirthYear(e.target.value)} 
                    className="meta-select"
                  >
                    {Array.from({ length: 80 }, (_, i) => {
                      const yr = 2026 - i;
                      return <option key={yr} value={yr.toString()}>{yr}</option>;
                    })}
                  </select>
                ) : (
                  <span>{birthYear}</span>
                )}
              </div>
              <span className="meta-separator">•</span>
              <div className="meta-item">
                {gender === 'Nữ' ? <Venus size={12} className="meta-icon" /> : <Mars size={12} className="meta-icon" />}
                {isEditingProfile ? (
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)} 
                    className="meta-select"
                  >
                    <option value="Chọn giới tính">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <span>{gender}</span>
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

        {/* Tab Navigation (UserProfile Original Capsule Style with Slide Animation Highlight) */}
        <div className="profile-tabs-nav" style={{ position: 'relative' }}>
          {/* Animated pill background */}
          <div className="profile-tab-pill-container" style={{ position: 'absolute', top: 3, bottom: 3, left: 3, right: 3, display: 'flex', zIndex: 0, pointerEvents: 'none' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
              <motion.div
                layoutId="activeTabPill"
                animate={{
                  x: activeTab === 'overview' ? '0%' : '100%'
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                style={{
                  width: '50%',
                  height: '100%',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>
          </div>

          <button 
            className={`profile-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
            style={{ position: 'relative', zIndex: 1 }}
          >
            Tổng quan
          </button>
          <button 
            className={`profile-tab-button ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => handleTabChange('links')}
            style={{ position: 'relative', zIndex: 1 }}
          >
            Liên kết
          </button>
        </div>

        {/* Sliding Tab Body Wrapper */}
        <div className="profile-tab-body-wrapper" style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeTab}
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 350, damping: 28 },
                opacity: { duration: 0.12 }
              }}
              className="profile-tab-body"
              style={{ width: '100%' }}
            >
              {activeTab === 'overview' ? (
                <div className="overview-tab-content">
                  
                  {/* Host Dashboard Banner (Repositioned to the top of overview body - UserProfile2 design) */}
                  {isOwner ? (
                    <div className="owner-quick-access-banner" style={{ marginBottom: '8px' }}>
                      <div className="owner-banner-left">
                        <div className="owner-banner-title">VAI TRÒ CHỦ SÂN</div>
                        <div className="owner-banner-desc">Bạn đang đăng nhập với quyền chủ sân. Quản lý sân và lịch đặt của bạn dễ dàng hơn.</div>
                      </div>
                      <div className="owner-banner-actions">
                        <Link to="/owner" className="owner-banner-btn primary">
                          Dashboard
                        </Link>
                        <Link to="/owner/venues" className="owner-banner-btn outline">
                          Cấu hình sân
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="owner-quick-access-banner placeholder-cta" style={{ marginBottom: '8px' }}>
                      <div className="owner-banner-left">
                        <div className="owner-banner-title">Bạn có sân thể thao?</div>
                        <div className="owner-banner-desc">Đăng ký trở thành đối tác chủ sân để tiếp cận hàng nghìn khách hàng tiềm năng.</div>
                      </div>
                      <Link to="/owner/onboarding" className="owner-banner-btn primary">
                        Đăng ký chủ sân
                      </Link>
                    </div>
                  )}

                  {/* Module 1: THÔNG TIN THỂ CHẤT (UserProfile2 style with higher contrast colors) */}
                  <div className="overview-section-card">
                    <div className="section-card-header">
                      <h3 className="section-card-title">THÔNG TIN THỂ CHẤT</h3>
                      <button 
                        onClick={() => {
                          if (isEditingPhysical) {
                            handleSavePhysical();
                          }
                          setIsEditingPhysical(!isEditingPhysical);
                        }} 
                        className={`section-edit-btn ${isEditingPhysical ? 'active' : ''}`}
                        aria-label="Sửa thông tin thể chất"
                      >
                        {isEditingPhysical ? <Check size={14} /> : <Edit2 size={14} />}
                      </button>
                    </div>
                    {/* Double Card + BMI Layout */}
                    <div className="physical-cards-row">
                      <div className="physical-stat-card">
                        <div className="card-stat-header">
                          <span className="card-stat-title">Chiều cao</span>
                        </div>
                        <div className="card-stat-value">{height} <span className="unit">cm</span></div>
                        {isEditingPhysical && (
                          <input 
                            type="range" 
                            min="130" 
                            max="220" 
                            value={height} 
                            onChange={(e) => setHeight(Number(e.target.value))} 
                            className="stat-slider-mini"
                          />
                        )}
                      </div>

                      <div className="physical-stat-card">
                        <div className="card-stat-header">
                          <span className="card-stat-title">Cân nặng</span>
                        </div>
                        <div className="card-stat-value">{weight} <span className="unit">kg</span></div>
                        {isEditingPhysical && (
                          <input 
                            type="range" 
                            min="30" 
                            max="150" 
                            value={weight} 
                            onChange={(e) => setWeight(Number(e.target.value))} 
                            className="stat-slider-mini"
                          />
                        )}
                      </div>

                      <div className="physical-stat-card bmi-card-highlight">
                        <div className="card-stat-header">
                          <span className="card-stat-title">Chỉ số BMI</span>
                        </div>
                        <div className="card-stat-value">{bmi}</div>
                        <div className={`bmi-status-badge ${bmiClass}`}>{bmiStatus}</div>
                      </div>
                    </div>

                    {/* Special Notes box - Smart show/hide logic */}
                    {specialNotes && specialNotes !== 'Chưa có ghi chú đặc biệt' ? (
                      <div className="special-notes-wrapper2">
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
                            <button onClick={() => handleSaveNotes(specialNotes)} className="notes-save-btn">
                              Xác nhận
                            </button>
                          </div>
                        ) : (
                          <div className="notes-content-box">
                            <span className="notes-text">{specialNotes}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="special-notes-placeholder-row">
                        <span className="placeholder-text">Chưa có ghi chú đặc biệt nào</span>
                        {isEditingNotes ? (
                          <div className="notes-edit-container inline-edit">
                            <textarea 
                              value={specialNotes === 'Chưa có ghi chú đặc biệt' ? '' : specialNotes} 
                              onChange={(e) => setSpecialNotes(e.target.value)} 
                              placeholder="Nhập ghi chú đặc biệt của bạn..."
                              className="notes-textarea"
                            />
                            <button onClick={() => handleSaveNotes(specialNotes)} className="notes-save-btn">
                              Xác nhận
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setSpecialNotes('');
                              setIsEditingNotes(true);
                            }} 
                            className="add-notes-btn"
                          >
                            + Thêm ghi chú
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Module 2: CÁ NHÂN HÓA (UserProfile2 vertical list style with darker line dividers) */}
                  <div className="overview-section-card">
                    <div className="section-card-header">
                      <h3 className="section-card-title">CÁ NHÂN HÓA</h3>
                      <button 
                        onClick={() => {
                          if (isEditingPersonalization) {
                            handleSavePersonalization();
                          }
                          setIsEditingPersonalization(!isEditingPersonalization);
                        }} 
                        className={`section-edit-btn ${isEditingPersonalization ? 'active' : ''}`}
                        aria-label="Sửa cá nhân hóa"
                      >
                        {isEditingPersonalization ? <Check size={14} /> : <Edit2 size={14} />}
                      </button>
                    </div>

                    <div className="personalization-list">
                      {/* Vị trí yêu thích */}
                      <div className="personal-list-item">
                        <div className="item-left">
                          <MapPin size={18} className="item-icon" />
                          <div className="item-details">
                            <span className="item-label">Vị trí yêu thích</span>
                            {isEditingPersonalization ? (
                              <input 
                                type="text" 
                                value={favPosition} 
                                onChange={(e) => setFavPosition(e.target.value)} 
                                className="item-input"
                              />
                            ) : (
                              <span className="item-value">
                                {favPosition === 'Chưa cập nhật' ? (
                                  <button onClick={() => setIsEditingPersonalization(true)} className="cta-link-btn">
                                    + Thêm vị trí
                                  </button>
                                ) : (
                                  favPosition
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Thể thao & Trình độ */}
                      <div className="personal-list-item">
                        <div className="item-left">
                          <Activity size={18} className="item-icon" />
                          <div className="item-details">
                            <span className="item-label">Thể thao & Trình độ</span>
                            {isEditingPersonalization ? (
                              <input 
                                type="text" 
                                value={sportsLevel} 
                                onChange={(e) => setSportsLevel(e.target.value)} 
                                className="item-input"
                              />
                            ) : (
                              <span className="item-value">
                                {sportsLevel === 'Chưa cập nhật' ? (
                                  <button onClick={() => setIsEditingPersonalization(true)} className="cta-link-btn">
                                    + Chọn trình độ
                                  </button>
                                ) : (
                                  sportsLevel
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mục tiêu */}
                      <div className="personal-list-item">
                        <div className="item-left">
                          <Trophy size={18} className="item-icon" />
                          <div className="item-details">
                            <span className="item-label">Mục tiêu</span>
                            {isEditingPersonalization ? (
                              <input 
                                type="text" 
                                value={goals} 
                                onChange={(e) => setGoals(e.target.value)} 
                                className="item-input"
                              />
                            ) : (
                              <span className="item-value">
                                {goals === 'Chưa cập nhật' ? (
                                  <button onClick={() => setIsEditingPersonalization(true)} className="cta-link-btn">
                                    + Thêm mục tiêu
                                  </button>
                                ) : (
                                  goals
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tần suất chơi */}
                      <div className="personal-list-item no-border">
                        <div className="item-left">
                          <Calendar size={18} className="item-icon" />
                          <div className="item-details">
                            <span className="item-label">Tần suất chơi</span>
                            {isEditingPersonalization ? (
                              <input 
                                type="text" 
                                value={frequency} 
                                onChange={(e) => setFrequency(e.target.value)} 
                                className="item-input"
                              />
                            ) : (
                              <div className="frequency-display-row">
                                <span className="item-value">
                                  {frequency === 'Chưa cập nhật' ? (
                                    <button onClick={() => setIsEditingPersonalization(true)} className="cta-link-btn">
                                      + Thiết lập tần suất
                                    </button>
                                  ) : (
                                    frequency
                                  )}
                                </span>
                                
                                <div className={`frequency-mini-calendar2 ${frequency === 'Chưa cập nhật' ? 'not-configured' : ''}`}>
                                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => {
                                    const isActive = frequency !== 'Chưa cập nhật' && ['T2', 'T4', 'T6'].includes(day);
                                    return (
                                      <span key={day} className={`mini-day2 ${isActive ? 'active' : ''}`}>
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
                  </div>

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
            </motion.div>
          </AnimatePresence>

          <p className="profile-version-footer">SPORTCONNECT v1.2.0</p>
        </div>
      </div>
    </MainLayout>
  );
}
