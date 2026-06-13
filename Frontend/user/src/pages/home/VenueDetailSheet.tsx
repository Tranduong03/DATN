import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Heart, MapPin, Clock, Star, Phone, ArrowLeft, Copy } from 'lucide-react';
import { usePublicVenueDetail } from '../../hooks/queries/usePublicQueries';
import { useVenueReviews } from '../../hooks/queries/useReviewQueries';
import { useNavigate } from 'react-router-dom';

interface VenueDetailSheetProps {
  venueId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VenueDetailSheet({ venueId, isOpen, onClose }: VenueDetailSheetProps) {
  const navigate = useNavigate();
  const [sheetState, setSheetState] = useState<'closed' | 'half' | 'full'>('closed');
  
  // Touch Gestures State
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'images' | 'rules' | 'reviews'>('info');
  const [copied, setCopied] = useState(false);

  // Refs
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Data (only query if venueId is present)
  const { data: venue, isLoading: loadingVenue } = usePublicVenueDetail(venueId || '');
  const { data: reviews = [] } = useVenueReviews(venueId || '');

  // Sync state with isOpen prop
  useEffect(() => {
    if (isOpen && venueId) {
      setSheetState('half');
      setActiveTab('info');
    } else {
      setSheetState('closed');
    }
  }, [isOpen, venueId]);

  // Reset scroll container to top when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, venueId]);

  // Calculate snap positions in pixels
  // - closed: translates the entire sheet down (height of sheet = 91% viewport)
  // - half: translates sheet down by 41% viewport, leaving 50% visible
  // - full: translateY = 0, leaving 91% viewport visible
  const getSnapPx = (state: 'closed' | 'half' | 'full', height: number) => {
    if (state === 'closed') return height;
    if (state === 'half') return Math.max(0, height - (window.innerHeight * 0.5));
    return 0; // full
  };

  // Initialize or handle resize
  useEffect(() => {
    if (sheetRef.current) {
      const height = sheetRef.current.offsetHeight;
      setTranslateY(getSnapPx(sheetState, height));
    }
  }, [sheetState, isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select')) {
      return;
    }

    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
    setIsTransitioning(false);

    if (sheetRef.current) {
      const currentHeight = sheetRef.current.offsetHeight;
      const initialTranslateY = getSnapPx(sheetState, currentHeight);
      setCurrentY(initialTranslateY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sheetRef.current) return;
    const touch = e.touches[0];
    const diffY = touch.clientY - startY;
    const height = sheetRef.current.offsetHeight;

    if (sheetState === 'half') {
      // Swiping UP (diffY < -15) triggers FULL state (91% height) immediately
      if (diffY < -15) {
        setIsDragging(false);
        snapTo('full');
      }
      // Swiping down is blocked at half state
      return;
    }

    if (sheetState === 'full') {
      // At full state, only allow dragging DOWN (diffY > 0)
      const scrollEl = scrollContainerRef.current;
      const isScrolledToTop = scrollEl ? scrollEl.scrollTop === 0 : true;

      const isTouchingHeader = (e.target as HTMLElement).closest('.bottom-sheet-floating-header') || 
                               (e.target as HTMLElement).closest('.bottom-sheet-drag-handle-container') ||
                               (e.target as HTMLElement).closest('.bottom-sheet-fixed-header');

      if (diffY > 0 && (isTouchingHeader || isScrolledToTop)) {
        if (e.cancelable) e.preventDefault();
        const constrainedY = Math.max(0, Math.min(height, diffY));
        setTranslateY(constrainedY);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !sheetRef.current) return;
    setIsDragging(false);
    setIsTransitioning(true);

    if (sheetState === 'full') {
      // Dragged down past 100px: Close completely. Otherwise: Snap back to full height.
      if (translateY > 100) {
        snapTo('closed');
      } else {
        snapTo('full');
      }
    }
  };

  // Helper to programmatically snap
  const snapTo = (state: 'closed' | 'half' | 'full') => {
    setIsTransitioning(true);
    setSheetState(state);
    if (sheetRef.current) {
      setTranslateY(getSnapPx(state, sheetRef.current.offsetHeight));
    }
    if (state === 'closed') {
      onClose();
    }
  };

  const handleCopyLink = () => {
    const linkText = `https://datlich.alobo.vn/san/${venue?.id || ''}`;
    navigator.clipboard.writeText(linkText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSportBadge = (sportTypes: string[]) => {
    if (!sportTypes || sportTypes.length === 0) return '🏸 Cầu lông';
    const firstSport = sportTypes[0];
    if (firstSport.toLowerCase().includes('cầu lông')) return '🏸 Cầu lông';
    if (firstSport.toLowerCase().includes('pickleball')) return '🎾 Pickleball';
    if (firstSport.toLowerCase().includes('bóng đá')) return '⚽ Bóng đá';
    if (firstSport.toLowerCase().includes('tennis')) return '🥎 Tennis';
    if (firstSport.toLowerCase().includes('bóng chuyền')) return '🏐 Bóng chuyền';
    if (firstSport.toLowerCase().includes('bóng rổ')) return '🏀 Bóng rổ';
    return `🏆 ${firstSport}`;
  };

  const inlineStyles = {
    transform: `translate(-50%, ${translateY}px)`
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={`bottom-sheet-backdrop ${sheetState !== 'closed' ? 'open' : ''}`} 
        onClick={() => snapTo('closed')}
      />

      {/* Sheet */}
      <div 
        ref={sheetRef}
        className={`bottom-sheet state-${sheetState} ${isTransitioning ? 'transitioning' : ''}`}
        style={inlineStyles}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle Container */}
        <div className="bottom-sheet-drag-handle-container">
          <div className="bottom-sheet-drag-handle" />
        </div>

        {/* Content */}
        {loadingVenue ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24 }}>
            <span style={{ fontSize: 15, color: '#64748b' }}>Đang tải thông tin sân...</span>
          </div>
        ) : venue ? (
          <>
            {/* Floating Header Actions (stay static at the very top of the sheet) */}
            <div className="bottom-sheet-floating-header">
              <button className="bottom-sheet-close-btn" onClick={() => snapTo('closed')}>
                <ArrowLeft size={20} />
              </button>
              <div className="bottom-sheet-header-right-actions">
                <button className="bottom-sheet-action-btn" style={{ marginRight: 4 }}>
                  <Share2 size={18} />
                </button>
                <button className="bottom-sheet-action-btn" style={{ marginRight: 8 }}>
                  <Heart size={18} />
                </button>
                <button 
                  className="bottom-sheet-book-header-btn"
                  onClick={() => {
                    window.open(`https://sport-connect.com/venues/${venue.id || ''}`, '_blank');
                  }}
                >
                  Đặt lịch
                </button>
              </div>
            </div>

            {/* Fixed Header (Cover Image + Overlapping Venue Detail Card) */}
            <div className="bottom-sheet-fixed-header">
              {/* Cover Image */}
              <div 
                className="bottom-sheet-cover-bg"
                style={{ 
                  backgroundImage: venue.coverUrl ? `url(${venue.coverUrl})` : (venue.avatarUrl ? `url(${venue.avatarUrl})` : 'none'),
                  backgroundColor: '#A8DADC'
                }}
              />

              {/* Venue Card - Glassmorphism profile layout */}
              <div className="venue-sheet-card">
                {/* Rating Pill - centered at the top margin */}
                <div className="venue-sheet-rating-pill">
                  <Star size={14} fill="#fff" color="#fff" />
                  <span>{venue.rating || 5.0} ({venue.reviewCount || 0} đánh giá)</span>
                </div>

                {/* Horizontal row for Avatar & Title + Sport Category */}
                <div className="venue-sheet-header-row">
                  <div className="venue-sheet-avatar-left">
                    {venue.avatarUrl ? (
                      <img src={venue.avatarUrl} alt="Logo" />
                    ) : (
                      <div className="venue-sheet-avatar-placeholder">
                        {venue.name?.substring(0, 2).toUpperCase() || 'SC'}
                      </div>
                    )}
                  </div>
                  <div className="venue-sheet-title-info-right">
                    <h2 className="venue-sheet-title-left">{venue.name}</h2>
                    <span className="venue-sheet-badge-left">
                      {getSportBadge(venue.sportTypes)}
                    </span>
                  </div>
                </div>

                <hr className="venue-sheet-divider" />

                {/* Details List */}
                <div className="venue-sheet-details-list">
                  <div className="venue-sheet-detail-row">
                    <MapPin size={16} className="venue-sheet-detail-icon" />
                    <span className="venue-sheet-detail-text">{venue.address}</span>
                  </div>

                  <div className="venue-sheet-detail-row">
                    <Clock size={16} className="venue-sheet-detail-icon" />
                    <span className="venue-sheet-detail-text">Mở cửa: {venue.operatingStartHour} - {venue.operatingEndHour}</span>
                  </div>

                  {/* Contact Hotline row */}
                  <div className="venue-sheet-detail-row" style={{ alignItems: 'flex-start' }}>
                    <Phone size={16} className="venue-sheet-detail-icon" style={{ marginTop: '2px' }} />
                    <div className="venue-sheet-contacts-col">
                      {venue.contactPhone ? (
                        <a href={`tel:${venue.contactPhone}`} className="venue-sheet-contact-link">
                          Liên hệ: {venue.contactPhone}
                        </a>
                      ) : (
                        <span className="venue-sheet-contact-placeholder">
                          Liên hệ: chưa cập nhật
                        </span>
                      )}

                      {venue.contactPhone2 ? (
                        <a href={`tel:${venue.contactPhone2}`} className="venue-sheet-contact-link">
                          Liên hệ: {venue.contactPhone2}
                        </a>
                      ) : (
                        <span className="venue-sheet-contact-placeholder">
                          Liên hệ: chưa cập nhật
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Body (Only tabs and their contents) */}
            <div className="bottom-sheet-body" ref={scrollContainerRef}>
              {/* Tabs */}
              <div className="sheet-tabs-container">
                <div className="sheet-tab-header-list">
                  <button 
                    className={`sheet-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    Thông tin
                  </button>
                  <button 
                    className={`sheet-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveTab('services')}
                  >
                    Dịch vụ
                  </button>
                  <button 
                    className={`sheet-tab-btn ${activeTab === 'images' ? 'active' : ''}`}
                    onClick={() => setActiveTab('images')}
                  >
                    Hình ảnh
                  </button>
                  <button 
                    className={`sheet-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rules')}
                  >
                    Điều khoản & quy định
                  </button>
                  <button 
                    className={`sheet-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    Đánh giá
                  </button>
                </div>

                <div className="sheet-tab-pane">
                  {activeTab === 'info' && (
                    <div>
                      <p className="sheet-tab-text" style={{ marginBottom: 16 }}>
                        {venue.description || 'Chưa có mô tả chi tiết cho sân này.'}
                      </p>
                      
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e06e1b', margin: '16px 0 8px 0' }}>Link đặt sân online</h4>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f8fafc', border: '1px solid #f1f5f9', padding: '10px 12px', borderRadius: '8px' }}>
                        <a 
                          href={`https://datlich.alobo.vn/san/${venue.id || ''}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ fontSize: 12, color: '#b45309', wordBreak: 'break-all', textDecoration: 'none', fontWeight: 550 }}
                        >
                          https://datlich.alobo.vn/san/{venue.id || ''}
                        </a>
                        <button 
                          onClick={handleCopyLink}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center' }}
                        >
                          {copied ? <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Đã chép</span> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'services' && (
                    <div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: '1.8' }}>
                        <li>Wifi miễn phí</li>
                        <li>Bãi đỗ xe ô tô, xe máy rộng rãi</li>
                        <li>Cho thuê vợt, bóng/quả cầu lông</li>
                        <li>Căng tin phục vụ nước uống & đồ ăn nhẹ</li>
                        <li>Hệ thống đèn LED đạt tiêu chuẩn thi đấu</li>
                      </ul>
                    </div>
                  )}

                  {activeTab === 'images' && (
                    <div className="sheet-gallery-grid">
                      {venue.galleryImages && venue.galleryImages.length > 0 ? (
                        venue.galleryImages.map((img: string, idx: number) => (
                          <img key={idx} src={img} alt={`Gallery ${idx}`} className="sheet-gallery-img" />
                        ))
                      ) : (
                        <span className="sheet-tab-text" style={{ gridColumn: 'span 2' }}>Không có hình ảnh cơ sở.</span>
                      )}
                    </div>
                  )}

                  {activeTab === 'rules' && (
                    <div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: '1.8' }}>
                        <li>Đến đúng giờ đã đặt lịch.</li>
                        <li>Mang giày chuyên dụng cho các loại sân tương ứng để bảo vệ mặt thảm.</li>
                        <li>Không mang theo thức ăn nhiều dầu mỡ hay đồ có gas lên mặt sân.</li>
                        <li>Giữ gìn vệ sinh chung, vứt rác đúng nơi quy định.</li>
                      </ul>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div>
                      {reviews && reviews.length > 0 ? (
                        reviews.map((review: any) => (
                          <div key={review.id} className="sheet-review-item">
                            <div className="sheet-review-header">
                              <div className="sheet-review-user">
                                {review.userAvatar ? (
                                  <img src={review.userAvatar} alt={review.userName} className="sheet-review-avatar" />
                                ) : (
                                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>
                                    {review.userName?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="sheet-review-username">{review.userName}</span>
                              </div>
                              <div className="sheet-review-rating">
                                <Star size={10} fill="#d97706" color="#d97706" />
                                <span>{review.rating}</span>
                              </div>
                            </div>
                            {review.comment && <p className="sheet-review-comment">{review.comment}</p>}
                          </div>
                        ))
                      ) : (
                        <span className="sheet-tab-text">Chưa có đánh giá nào.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24 }}>
            <span style={{ fontSize: 15, color: '#64748b' }}>Không tìm thấy thông tin sân.</span>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
