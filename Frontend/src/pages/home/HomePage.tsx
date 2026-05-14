import { useState } from 'react';
import { Bell, Search, Heart, Share2, Star, Clock } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

export default function HomePage() {
  const [activeSport, setActiveSport] = useState('Pickleball');

  const quickFilters = ['Cầu lông gần tôi', 'Pickleball gần tôi', 'Xé vé gần tôi', 'Bóng đá gần tôi'];
  
  const sports = [
    { name: 'Pickleball', color: '#4A90E2', icon: '🎾' }, // using emojis temporarily for variety, will style later
    { name: 'Cầu lông', color: '#50E3C2', icon: '🏸' },
    { name: 'Bóng đá', color: '#7ED321', icon: '⚽' },
    { name: 'Tennis', color: '#F5A623', icon: '🥎' },
    { name: 'B.Chuyền', color: '#F8E71C', icon: '🏐' },
    { name: 'Bóng rổ', color: '#FF9500', icon: '🏀' },
  ];

  const venues = [
    {
      id: 1,
      name: 'Catchy Pickleball Club (Sân có mái che)',
      distance: '6.7km',
      address: 'Đối diện ngõ 136 phố Tân Khai, quận H...',
      time: '05:00 - 24:00',
      rating: 4.6,
      tags: ['Đơn ngày', 'Sự kiện'],
      logoColor: '#F5A623',
      coverColor: '#A8DADC',
    },
    {
      id: 2,
      name: 'Family Pickleball',
      distance: '92.1km',
      address: 'Số 6/215 P Lê Lai, Máy Chai, Ngô Quy...',
      time: '06:00 - 22:00',
      rating: 0,
      tags: ['Đơn ngày', 'Sự kiện'],
      logoColor: '#1D3557',
      coverColor: '#457B9D',
    },
    {
      id: 3,
      name: 'Hường Đỗ Central-418 Bà Triệu',
      distance: '135.6km',
      address: 'Đ. Bà Triệu/418 Phường Hạc Thành, tỉ...',
      time: '05:00 - 22:00',
      rating: 0,
      tags: ['Đơn ngày', 'Sự kiện'],
      logoColor: '#E63946',
      coverColor: '#1A1A24',
    }
  ];

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

          {/* Venue List */}
          <div className="venue-list">
            {venues.map(venue => (
              <div key={venue.id} className="venue-card">
                <div className="venue-cover" style={{ backgroundColor: venue.coverColor }}>
                  <div className="venue-badges">
                    {venue.rating > 0 ? (
                      <span className="badge badge-rating">
                        <Star size={12} fill="#F5A623" color="#F5A623" /> {venue.rating}
                      </span>
                    ) : (
                      <span className="badge badge-rating">
                        <Star size={12} color="#999" />
                      </span>
                    )}
                    {venue.tags.map((tag, idx) => (
                      <span key={idx} className={`badge badge-${tag === 'Đơn ngày' ? 'green' : 'purple'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="venue-cover-actions">
                    <button className="action-btn"><Heart size={16} /></button>
                    <button className="action-btn"><Share2 size={16} /></button>
                  </div>
                </div>
                
                <div className="venue-info">
                  <div className="venue-logo-placeholder" style={{ backgroundColor: venue.logoColor }}></div>
                  <div className="venue-details">
                    <h3 className="venue-name">{venue.name}</h3>
                    <div className="venue-address">
                      <span className="distance">({venue.distance})</span> {venue.address}
                    </div>
                    <div className="venue-time">
                      <Clock size={12} /> {venue.time}
                    </div>
                  </div>
                  <button className="btn-book">ĐẶT LỊCH</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
