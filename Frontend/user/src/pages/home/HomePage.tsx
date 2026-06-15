import { useState, useEffect } from 'react';
import { Bell, Search, Heart, Share2, Star, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenues, useSportCategories } from '../../hooks/queries/usePublicQueries';
import { jwtDecode } from 'jwt-decode';
import VenueDetailSheet from './VenueDetailSheet';
import { ensureValidToken } from '../../utils/auth';
import { FALLBACK_SPORTS } from '../../utils/sport';

export default function HomePage() {
  const [activeSport, setActiveSport] = useState('');
  const [searchTerm] = useState(''); 
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('Khách');
  const [userAvatar, setUserAvatar] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showNotiPopover, setShowNotiPopover] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth & Favorites States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Bottom Sheet State
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    // 1. Format Ngày (VD: Thứ năm, 14/05/2026)
    const date = new Date();
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayName = days[date.getDay()];
    const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    setCurrentDate(`${dayName}, ${dateStr}`);

    // 2. Decode Token lấy tên User & Avatar
    const verifyAndLoadUser = async () => {
      const validToken = await ensureValidToken();
      if (validToken) {
        try {
          const decoded: any = jwtDecode(validToken);
          setUserName(decoded.FullName || decoded.unique_name || 'Khách hàng');
          setUserAvatar(decoded.AvatarUrl || '/icon/avata_boy_1.avif');
          setIsLoggedIn(true);
          const uId = decoded.id || decoded.sub || 'default';
          setUserId(uId);

          // Load user-specific favorites
          const savedFavorites = localStorage.getItem(`favorites_${uId}`);
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
          }
        } catch (err) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserName('Khách');
        setUserAvatar('');
      }
    };
    
    verifyAndLoadUser();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleFavorite = (venueId: any) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    let newFavorites;
    if (favorites.includes(venueId)) {
      newFavorites = favorites.filter(id => id !== venueId);
      setToastMessage('Đã xóa khỏi danh sách yêu thích');
    } else {
      newFavorites = [...favorites, venueId];
      setToastMessage('Đã thêm vào danh sách yêu thích');
    }
    setFavorites(newFavorites);
    if (userId) {
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavorites));
    }
  };

  const { data: venues = [], isLoading } = usePublicVenues(searchTerm);

  const displayVenues = venues.filter((venue: any) => {
    const matchesSport = activeSport
      ? venue.sportTypes?.some((s: string) => s.toLowerCase().includes(activeSport.toLowerCase()))
      : true;
      
    const matchesFavorite = showOnlyFavorites
      ? favorites.includes(venue.id)
      : true;
      
    return matchesSport && matchesFavorite;
  });

  const quickFilters = ['Cầu lông gần tôi', 'Pickleball gần tôi', 'Xé vé gần tôi', 'Bóng đá gần tôi'];
  
  const { data: sportsData = [] } = useSportCategories();

  // Dùng dữ liệu từ API nếu có, không thì dùng dữ liệu mẫu
  const sports = sportsData.length > 0 ? sportsData : FALLBACK_SPORTS;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <MainLayout>
      <div className="home-page">
        {/* Header Section */}
        <div className="home-header">
          <div className="home-header-top">
            <div className="user-info">
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="user-avatar-placeholder" style={{ objectFit: 'cover', padding: 0 }} />
              ) : (
                <div className="user-avatar-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 'bold' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="user-text">
                <div className="date-text">{currentDate}</div>
                <div className="user-name">{userName}</div>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn reward-btn">
                <Star size={18} fill="#FFD700" color="#FFD700" />
                <span className="dot-indicator"></span>
              </button>
              <div style={{ position: 'relative' }}>
                <button className="icon-btn" onClick={() => setShowNotiPopover(!showNotiPopover)}>
                  <Bell size={20} color="#fff" />
                </button>
                {showNotiPopover && (
                  <>
                    <div 
                      onClick={() => setShowNotiPopover(false)} 
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} 
                    />
                    <div style={{
                      position: 'absolute',
                      top: '42px',
                      right: '0',
                      backgroundColor: '#ffffff',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #e2e8f0',
                      zIndex: 100,
                      minWidth: '160px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '12px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#ffffff',
                        transform: 'rotate(45deg)',
                        borderTop: '1px solid #e2e8f0',
                        borderLeft: '1px solid #e2e8f0'
                      }} />
                      <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>
                        Chưa có thông báo
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-bar">
              <div className="search-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={14} color="#fff" />
              </div>
              <input type="text" placeholder="Tìm kiếm" />
              <button className="search-submit">
                <Search size={20} color="#666" />
              </button>
            </div>
            <button 
              className={`favorite-btn ${showOnlyFavorites ? 'active' : ''}`}
              onClick={() => {
                if (!isLoggedIn) {
                  navigate('/login');
                  return;
                }
                
                if (favorites.length === 0) {
                  setToastMessage('Chưa có sân yêu thích');
                  setShowOnlyFavorites(false);
                } else {
                  setShowOnlyFavorites(!showOnlyFavorites);
                }
              }}
              style={{
                color: showOnlyFavorites ? '#ef4444' : undefined,
                backgroundColor: showOnlyFavorites ? '#fee2e2' : undefined
              }}
            >
              <Heart 
                size={20} 
                fill={showOnlyFavorites ? '#ef4444' : 'none'} 
                color={showOnlyFavorites ? '#ef4444' : '#666'} 
              />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="home-content">
          
          {/* Quick Filters */}
          <div className="quick-filters">
            {quickFilters.map((filter, index) => (
              <button key={index} className="filter-chip">{filter}</button>
            ))}
          </div>

          {/* Sports Categories */}
          <div className="sports-categories">
            {sports.map((sport: any, index: number) => (
              <div 
                key={index} 
                className={`sport-item ${activeSport === sport.name ? 'active' : ''}`}
                onClick={() => {
                  if (activeSport === sport.name) {
                    setActiveSport('');
                  } else {
                    setActiveSport(sport.name);
                  }
                }}
              >
                <div className="sport-icon" style={{ backgroundColor: '#fff', border: `1px solid ${sport.color}` }}>
                  <span style={{ fontSize: '24px' }}>{sport.icon}</span>
                </div>
                <span className="sport-name">{sport.name}</span>
              </div>
            ))}
          </div>

          <div className="venue-list">
            {isLoading ? (
              <p>Đang tải danh sách sân...</p>
            ) : displayVenues.length === 0 ? (
              <p>{showOnlyFavorites ? 'Chưa có sân yêu thích nào cho bộ lọc này.' : 'Không tìm thấy sân nào.'}</p>
            ) : displayVenues.map((venue: any) => (
              <div 
                key={venue.id} 
                className="venue-card" 
                onClick={() => {
                  setSelectedVenueId(venue.id);
                  setIsSheetOpen(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="venue-cover" 
                  style={{ 
                    backgroundImage: venue.coverUrl ? `url(${venue.coverUrl})` : (venue.avatarUrl ? `url(${venue.avatarUrl})` : 'none'), 
                    backgroundColor: venue.coverUrl || venue.avatarUrl ? 'transparent' : '#A8DADC',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <div className="venue-badges">
                    <span className="badge badge-rating">
                      <Star size={12} fill="#F5A623" color="#F5A623" /> {venue.rating}
                    </span>
                    <span className="badge badge-green">Từ {formatPrice(venue.minPrice)}/h</span>
                  </div>
                  <div className="venue-cover-actions">
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(venue.id);
                      }}
                      style={{ 
                        color: favorites.includes(venue.id) ? '#ef4444' : undefined,
                        backgroundColor: favorites.includes(venue.id) ? '#fee2e2' : undefined
                      }}
                    >
                      <Heart 
                        size={16} 
                        fill={favorites.includes(venue.id) ? '#ef4444' : 'none'} 
                        color={favorites.includes(venue.id) ? '#ef4444' : 'currentColor'}
                      />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Share logic if any, otherwise just stop propagation
                      }}
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="venue-info">
                  <div className="venue-logo-placeholder" style={{ backgroundColor: '#F5A623', overflow: 'hidden' }}>
                    {venue.avatarUrl ? (
                      <img src={venue.avatarUrl} alt="Logo" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'white', fontWeight: 'bold' }}>{venue.name.substring(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="venue-details">
                    <h3 className="venue-name">{venue.name}</h3>
                    <div className="venue-address">
                      <span className="distance">({venue.distance})</span> {venue.address}
                    </div>
                    <div className="venue-time">
                      <Clock size={12} /> {venue.operatingStartHour} - {venue.operatingEndHour}
                    </div>
                  </div>
                  <button 
                    className="btn-book" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/UserBooking?venueId=${venue.id}`);
                    }}
                  >
                    ĐẶT LỊCH
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Venue Detail Bottom Sheet */}
      <VenueDetailSheet
        venueId={selectedVenueId}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* Login Popup Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 11000,
          padding: '24px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            width: '100%',
            maxWidth: '340px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#064e3b', marginBottom: '12px', marginTop: 0 }}>
              Yêu cầu đăng nhập
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
              Bạn cần đăng nhập tài khoản để thực hiện lưu sân vào danh sách yêu thích.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowLoginModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  background: 'transparent',
                  color: '#475569',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/login');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#10b981',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          zIndex: 10000,
          fontWeight: '600',
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>❤️</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </MainLayout>
  );
}
