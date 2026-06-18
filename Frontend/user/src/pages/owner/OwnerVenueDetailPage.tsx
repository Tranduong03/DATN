import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, MapPin, Clock, Phone, Copy, Check, Edit3, Star, Layers, Calendar, Image as ImageIcon, FileText } from 'lucide-react';
import { useVenueDetail, useCourts, usePriceRules } from '../../hooks/queries/useOwnerQueries';
import { useTabDirection, TabUnderline, TabContentSlider } from '../../components/ui/AnimatedTabs';
import ownerDefaultImg from '../../assets/images/owner-default.webp';
import backdropImg from '../../assets/images/bg-default.webp';

type TabType = 'info' | 'pricing' | 'images' | 'reviews' | 'terms';

export default function OwnerVenueDetailPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tabsOrder: TabType[] = ['info', 'pricing', 'images', 'reviews', 'terms'];
  const { activeTab, direction, changeTab } = useTabDirection<TabType>('info', tabsOrder);
  const [copied, setCopied] = useState(false);
  const tabTransition = { type: 'tween', ease: 'easeOut', duration: 0.22 };

  // Queries
  const { data: venue, isLoading: loadingVenue } = useVenueDetail(venueId!);
  const { data: courts, isLoading: loadingCourts } = useCourts(venueId!);
  const { data: priceRules, isLoading: loadingPrices } = usePriceRules(venueId!);

  if (loadingVenue) {
    return (
      <div className="owner-venue-detail-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="admin-spinner"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="owner-venue-detail-page" style={{ padding: 20, textAlign: 'center' }}>
        <p>Không tìm thấy thông tin sân của bạn.</p>
        <button onClick={() => navigate('/owner')} className="admin-btn-primary" style={{ marginTop: 16 }}>Quay lại Dashboard</button>
      </div>
    );
  }

  const handleCopyLink = () => {
    const onlineLink = `${window.location.origin}/venue/${venue.id}`;
    navigator.clipboard.writeText(onlineLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Lỗi sao chép liên kết:', err));
  };

  // Determine avatar and backdrop
  const avatarUrl = venue.images?.find((img: any) => img.imageType === 'Avatar')?.imageUrl || ownerDefaultImg;
  const coverUrl = venue.images?.find((img: any) => img.imageType === 'Cover' || img.imageType === 'Gallery')?.imageUrl || backdropImg;

  // Format Day of Week for pricing
  const getDayName = (day: number | null | undefined) => {
    if (day === null || day === undefined) return 'Tất cả các ngày';
    if (day === 0) return 'Chủ nhật';
    return `Thứ ${day + 1}`;
  };

  return (
    <div className="owner-venue-detail-page">
      {/* 1. Header/Cover Container */}
      <div className="owner-venue-cover-container">
        <button className="owner-venue-back-btn" onClick={() => navigate('/owner')}>
          <ChevronLeft color="#fff" size={24} />
        </button>
        <img src={coverUrl} alt="Cover" className="owner-venue-cover-img" />
        <div className="owner-venue-cover-overlay" />
      </div>

      {/* 2. Overlapping Avatar & Venue Name Section */}
      <div className="owner-venue-header-info">
        <div className="owner-venue-avatar-wrapper">
          <img src={avatarUrl} alt="Avatar" className="owner-venue-avatar-img" />
        </div>
        <div className="owner-venue-title-section">
          <h1 className="owner-venue-name-text">{venue.name}</h1>
          <button className="owner-venue-more-btn" onClick={() => alert('Tính năng thêm sẽ sớm được hỗ trợ.')}>
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* 3. Horizontal Tab Bar */}
      <div className="owner-venue-tabs-bar">
        <button 
          className={`owner-venue-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => changeTab('info')}
        >
          Thông tin
          {activeTab === 'info' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
        <button 
          className={`owner-venue-tab ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => changeTab('pricing')}
        >
          Giá & D.vụ
          {activeTab === 'pricing' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
        <button 
          className={`owner-venue-tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => changeTab('images')}
        >
          Hình ảnh
          {activeTab === 'images' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
        <button 
          className={`owner-venue-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => changeTab('reviews')}
        >
          Đánh giá
          {activeTab === 'reviews' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
        <button 
          className={`owner-venue-tab ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => changeTab('terms')}
        >
          Điều khoản
          {activeTab === 'terms' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
      </div>

      {/* 4. Tab Content Area */}
      <div className="owner-venue-content">
        <TabContentSlider activeTab={activeTab} direction={direction} transition={tabTransition}>
          {activeTab === 'info' && (
            <div>
              <div className="owner-venue-info-list">
                <div className="owner-venue-info-item">
                  <MapPin size={20} className="owner-venue-info-icon" />
                  <span>{venue.address}</span>
                </div>
                <div className="owner-venue-info-item">
                  <Clock size={20} className="owner-venue-info-icon" />
                  <span>Giờ hoạt động: {venue.operatingStartHour || '05:00'} - {venue.operatingEndHour || '24:00'}</span>
                </div>
                <div className="owner-venue-info-item">
                  <Phone size={20} className="owner-venue-info-icon" />
                  <span>{venue.contactPhone || 'Chưa cấu hình SĐT'}</span>
                </div>
              </div>

              <div className="owner-venue-link-section">
                <h3 className="owner-venue-link-title">Link đặt sân online</h3>
                <div className="owner-venue-link-box">
                  <p className="owner-venue-link-text">
                    {`${window.location.origin}/venue/${venue.id}`}
                  </p>
                  <button className="owner-venue-copy-btn" onClick={handleCopyLink} title="Sao chép link">
                    {copied ? <Check size={25} color="#10b981" /> : <Copy size={25} color="#fff" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="owner-venue-pricing-tab">
              {/* Courts management summary */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={18} /> Danh sách sân con ({courts?.length || 0})
                </h3>
                {loadingCourts ? (
                  <p style={{ opacity: 0.7, fontSize: 14 }}>Đang tải danh sách sân...</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {courts?.map((c: any) => (
                      <div key={c.id} style={{ padding: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{c.courtName}</span>
                        <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, background: c.status === 'AVAILABLE' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: c.status === 'AVAILABLE' ? '#34d399' : '#f87171' }}>
                          {c.status === 'AVAILABLE' ? 'Hoạt động' : 'Bảo trì'}
                        </span>
                      </div>
                    ))}
                    {(!courts || courts.length === 0) && (
                      <p style={{ gridColumn: 'span 2', opacity: 0.7, fontSize: 14, textAlign: 'center' }}>Chưa cấu hình sân con.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price list */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={18} /> Bảng giá cấu hình
                </h3>
                {loadingPrices ? (
                  <p style={{ opacity: 0.7, fontSize: 14 }}>Đang tải bảng giá...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {priceRules?.map((rule: any) => (
                      <div key={rule.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{getDayName(rule.dayOfWeek)}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                            {rule.startHour} - {rule.endHour} {rule.description ? `(${rule.description})` : ''}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#f5d061', fontSize: 15 }}>
                          {rule.price.toLocaleString('vi-VN')} đ/h
                        </div>
                      </div>
                    ))}
                    {(!priceRules || priceRules.length === 0) && (
                      <p style={{ opacity: 0.7, fontSize: 14, textAlign: 'center' }}>Chưa cấu hình khung giá.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="owner-venue-images-tab">
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ImageIcon size={18} /> Hình ảnh cơ sở ({venue.images?.length || 0})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {venue.images?.map((img: any) => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 80, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={img.imageUrl} alt="Venue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '1px 4px', borderRadius: 3, fontSize: 8 }}>
                      {img.imageType === 'Avatar' ? 'Đại diện' : 'Thư viện'}
                    </span>
                  </div>
                ))}
                {(!venue.images || venue.images.length === 0) && (
                  <p style={{ gridColumn: 'span 3', opacity: 0.7, fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Chưa có hình ảnh nào.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="owner-venue-reviews-tab">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 8 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#f5d061' }}>{venue.averageRating || '5.0'}</div>
                <div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= Math.round(venue.averageRating || 5) ? '#f5d061' : 'none'} color="#f5d061" />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Dựa trên {venue.reviewCount || 0} lượt đánh giá</div>
                </div>
              </div>
              <p style={{ fontSize: 14, opacity: 0.8, textAlign: 'center', padding: '10px 0' }}>Chưa có bình luận chi tiết từ khách hàng.</p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="owner-venue-terms-tab" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, lineHeight: 1.5, opacity: 0.9 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={18} /> Nội quy & Điều khoản đặt sân
              </h3>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 8, borderLeft: '3px solid #f5d061' }}>
                <strong style={{ display: 'block', marginBottom: 4, color: '#f5d061' }}>1. Quy định thời gian</strong>
                Người chơi cần có mặt trước thời gian đặt lịch ít nhất 10 phút để nhận sân và chuẩn bị.
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 8, borderLeft: '3px solid #f5d061' }}>
                <strong style={{ display: 'block', marginBottom: 4, color: '#f5d061' }}>2. Hủy hoặc đổi lịch</strong>
                Khách hàng được phép hủy sân hoặc bảo lưu giờ chơi trước giờ bắt đầu tối thiểu 24 tiếng. Hủy sau thời gian này sẽ không được hoàn tiền.
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 8, borderLeft: '3px solid #f5d061' }}>
                <strong style={{ display: 'block', marginBottom: 4, color: '#f5d061' }}>3. Nội quy chung cơ sở</strong>
                Yêu cầu mang giày thể thao phù hợp (đế cao su không ra màu), giữ gìn vệ sinh chung, không mang chất cấm, vũ khí hoặc đồ uống có cồn vào khu vực thi đấu.
              </div>
            </div>
          )}
        </TabContentSlider>
      </div>

      {/* 5. Floating Action Button Container */}
      <div className="owner-venue-fab-container">
        <button className="owner-venue-fab" onClick={() => navigate(`/owner/venues/${venue.id}/edit`)}>
          <Edit3 size={16} />
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  );
}
