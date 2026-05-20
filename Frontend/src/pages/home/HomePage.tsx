import { useState } from 'react';
import { Bell, Search, Heart, Share2, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenues } from '../../hooks/queries/usePublicQueries';

export default function HomePage() {
  const [activeSport, setActiveSport] = useState('Pickleball');
  const [searchTerm] = useState(''); // We can use it later
  const navigate = useNavigate();

  const { data: venuesData, isLoading } = usePublicVenues(searchTerm);
  const venues = venuesData?.data || [];

  const quickFilters = ['Cầu lông gần tôi', 'Pickleball gần tôi', 'Xé vé gần tôi', 'Bóng đá gần tôi'];
  
  const sports = [
    { name: 'Pickleball', color: '#4A90E2', icon: '🎾' },
    { name: 'Cầu lông', color: '#50E3C2', icon: '🏸' },
    { name: 'Bóng đá', color: '#7ED321', icon: '⚽' },
    { name: 'Tennis', color: '#F5A623', icon: '🥎' },
    { name: 'B.Chuyền', color: '#F8E71C', icon: '🏐' },
    { name: 'Bóng rổ', color: '#FF9500', icon: '🏀' },
  ];

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
              <div className="user-avatar-placeholder"></div>
              <div className="user-text">
                <div className="date-text">Thứ năm, 14/05/2026</div>
                <div className="user-name">Phi Dương</div>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn reward-btn">
                <Star size={18} fill="#FFD700" color="#FFD700" />
                <span className="dot-indicator"></span>
              </button>
              <button className="icon-btn">
                <Bell size={20} color="#fff" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-bar">
              <div className="search-logo-icon"></div>
              <input type="text" placeholder="Tìm kiếm" />
              <button className="search-submit">
                <Search size={20} color="#666" />
              </button>
            </div>
            <button className="favorite-btn">
              <Heart size={20} color="#666" />
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
            {sports.map((sport, index) => (
              <div 
                key={index} 
                className={`sport-item ${activeSport === sport.name ? 'active' : ''}`}
                onClick={() => setActiveSport(sport.name)}
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
            ) : venues.length === 0 ? (
              <p>Không tìm thấy sân nào.</p>
            ) : venues.map((venue: any) => (
              <div key={venue.id} className="venue-card">
                <div className="venue-cover" style={{ backgroundColor: '#A8DADC' }}>
                  <div className="venue-badges">
                    <span className="badge badge-rating">
                      <Star size={12} fill="#F5A623" color="#F5A623" /> {venue.rating}
                    </span>
                    <span className="badge badge-green">Từ {formatPrice(venue.minPrice)}/h</span>
                  </div>
                  <div className="venue-cover-actions">
                    <button className="action-btn"><Heart size={16} /></button>
                    <button className="action-btn"><Share2 size={16} /></button>
                  </div>
                </div>
                
                <div className="venue-info">
                  <div className="venue-logo-placeholder" style={{ backgroundColor: '#F5A623' }}>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{venue.name.substring(0,2).toUpperCase()}</span>
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
                  <button className="btn-book" onClick={() => navigate(`/venue/${venue.id}`)}>ĐẶT LỊCH</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
