import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Share2, Heart, MapPin, Clock, Star, Phone, ArrowLeft, Copy, Check } from 'lucide-react';
import { useTabDirection, TabUnderline, TabContentSlider } from '../../components/ui/AnimatedTabs';
import { usePublicVenueDetail, useSportCategories } from '../../hooks/queries/usePublicQueries';
import { useVenueReviews } from '../../hooks/queries/useReviewQueries';
import { getSportEmojiFromCategories, getSportColorFromCategories } from '../../utils/sport';

interface VenueDetailSheetProps {
  venueId: string | null;
  isOpen: boolean;
  onClose: () => void;
  favorites?: string[];
  onToggleFavorite?: (venueId: string) => void;
}

export default function VenueDetailSheet({
  venueId,
  isOpen,
  onClose,
  favorites = [],
  onToggleFavorite
}: VenueDetailSheetProps) {
  const navigate = useNavigate();
  const [sheetState, setSheetState] = useState<'closed' | 'half' | 'full'>('closed');

  // Touch Gestures State
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(typeof window !== 'undefined' ? window.innerHeight : 1000);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Tabs
  const { activeTab, direction, changeTab, setActiveTab } = useTabDirection<'info' | 'services' | 'images' | 'rules' | 'reviews'>(
    'info',
    ['info', 'services', 'images', 'rules', 'reviews']
  );
  const [copied, setCopied] = useState(false);

  // Refs
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Data (only query if venueId is present)
  const { data: venue, isLoading: loadingVenue } = usePublicVenueDetail(venueId || '');
  const { data: reviews = [] } = useVenueReviews(venueId || '');
  const { data: sportsData = [] } = useSportCategories();

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
      setTimeout(() => {
        onClose();
      }, 350);
    }
  };

  const handleCopyLink = () => {
    const linkText = `https://datlich.alobo.vn/san/${venue?.id || ''}`;
    navigator.clipboard.writeText(linkText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };




  const renderSportBadges = (sportTypes: string[]) => {
    const list = sportTypes || [];
    if (list.length === 0) return null;

    const getBadgeStyle = (sport: string) => {
      const color = getSportColorFromCategories(sport, sportsData);
      return {
        backgroundColor: color,
        color: '#ffffff',
        borderColor: color
      };
    };

    if (list.length <= 2) {
      return (
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
          {list.map((sport, idx) => (
            <span key={idx} className="venue-sheet-badge-left" style={getBadgeStyle(sport)}>
              {getSportEmojiFromCategories(sport, sportsData)} {sport}
            </span>
          ))}
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <span className="venue-sheet-badge-left" style={getBadgeStyle(list[0])}>
            {getSportEmojiFromCategories(list[0], sportsData)} {list[0]}
          </span>
          <span className="venue-sheet-badge-left" style={getBadgeStyle(list[1])}>
            {getSportEmojiFromCategories(list[1], sportsData)} {list[1]}
          </span>
          <span className="venue-sheet-badge-left" style={getBadgeStyle(list[1])}>
            {getSportEmojiFromCategories(list[2], sportsData)} {list[2]}
          </span>
          <span className="venue-sheet-badge-left" style={{ background: 'rgba(255,255,255,0.8)', color: '#545a63ff', borderColor: 'rgba(255,255,255,0.8)' }}>
            {list.length - 3}+
          </span>
        </div>
      );
    }
  };

  const handleBackdropClick = () => snapTo('closed');

  const inlineStyles = {
    transform: `translate(-50%, ${translateY}px)`
  };

  if (!isOpen && sheetState === 'closed') {
    return null;
  }

  return createPortal(
    <>
      <div
        className={`bottom-sheet-backdrop ${sheetState !== 'closed' ? 'open' : ''}`}
        onClick={handleBackdropClick}
      />

      <div
        ref={sheetRef}
        className={`bottom-sheet state-${sheetState} ${isTransitioning ? 'transitioning' : ''}`}
        style={inlineStyles}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bottom-sheet-drag-handle-container">
          <div className="bottom-sheet-drag-handle" />
        </div>

        {loadingVenue ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24 }}>
            <span style={{ fontSize: 15, color: '#64748b' }}>Đang tải thông tin sân...</span>
          </div>
        ) : venue ? (
          <>
            <div className="bottom-sheet-floating-header">
              <button className="bottom-sheet-close-btn" onClick={() => snapTo('closed')}>
                <ArrowLeft size={20} />
              </button>
              <div className="bottom-sheet-header-right-actions">
                <button className="bottom-sheet-action-btn" style={{ marginRight: 4 }} onClick={handleCopyLink}>
                  {copied ? <Check size={18} color="#10b981" /> : <Share2 size={18} />}
                </button>
                <button
                  className="bottom-sheet-action-btn"
                  style={{
                    marginRight: 8,
                    color: favorites.includes(venue.id) ? '#ef4444' : undefined,
                    backgroundColor: favorites.includes(venue.id) ? '#fee2e2' : undefined
                  }}
                  onClick={() => onToggleFavorite && onToggleFavorite(venue.id)}
                >
                  <Heart
                    size={18}
                    fill={favorites.includes(venue.id) ? '#ef4444' : 'none'}
                    color={favorites.includes(venue.id) ? '#ef4444' : 'currentColor'}
                  />
                </button>
                <button
                  className="bottom-sheet-book-header-btn"
                  onClick={() => {
                    navigate(`/UserBooking?venueId=${venue.id}`);
                  }}
                >
                  Đặt lịch
                </button>
              </div>
            </div>

            <div className="bottom-sheet-fixed-header">
              <div
                className="bottom-sheet-cover-bg"
                style={{
                  backgroundImage: venue.coverUrl ? `url(${venue.coverUrl})` : (venue.avatarUrl ? `url(${venue.avatarUrl})` : 'none'),
                  backgroundColor: '#A8DADC'
                }}
              />

              <div className="venue-sheet-card">
                <div className="venue-sheet-rating-pill">
                  <Star size={14} fill="#fff" color="#fff" />
                  <span>{venue.rating || 5.0} ({venue.reviewCount || 0} đánh giá)</span>
                </div>

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
                    {renderSportBadges(venue.sportTypes)}
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
                  {[
                    { id: 'info', label: 'Thông tin' },
                    { id: 'services', label: 'Dịch vụ' },
                    { id: 'images', label: 'Hình ảnh' },
                    { id: 'rules', label: 'Điều khoản' },
                    { id: 'reviews', label: 'Đánh giá' }
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        className={`sheet-tab-btn ${isActive ? 'active' : ''}`}
                        onClick={() => changeTab(tab.id as any)}
                        style={{ position: 'relative' }}
                      >
                        {tab.label}
                        {isActive && <TabUnderline />}
                      </button>
                    );
                  })}
                </div>

                <TabContentSlider activeTab={activeTab} direction={direction} className="sheet-tab-pane">
                  {activeTab === 'info' && (
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 550, color: '#e06e1b', margin: '8px 0 8px 0' }}>Link đặt sân online</h4>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                        <a
                          href={`https://datlich.alobo.vn/san/${venue.id || ''}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 13, color: '#02471fff', wordBreak: 'break-all', textDecoration: 'none', fontWeight: 300 }}
                        >
                          https://datlich.alobo.vn/san/{venue.id || ''}
                        </a>
                        <button
                          onClick={handleCopyLink}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
                        >
                          {copied ? <span style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>Đã chép</span> : <Copy size={24} />}
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
                </TabContentSlider>
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
