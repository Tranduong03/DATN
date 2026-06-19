import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, MoreVertical, MapPin, Clock, Phone, Copy, Check, Star, Image as ImageIcon, FileText } from 'lucide-react';
import { useVenueDetail, usePriceRules } from '../../hooks/queries/useOwnerQueries';
import { useTabDirection, TabUnderline, TabContentSlider } from '../../components/ui/AnimatedTabs';
import PricingTable from '../../components/ui/PricingTable';
import ownerDefaultImg from '../../assets/images/owner-default.webp';
import backdropImg from '../../assets/images/bg-default.webp';

type TabType = 'info' | 'pricing' | 'images' | 'reviews' | 'terms';

export default function OwnerVenueDetailPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as TabType | null;

  const tabsOrder: TabType[] = ['info', 'pricing', 'images', 'reviews', 'terms'];
  const { activeTab, direction, changeTab } = useTabDirection<TabType>(
    (queryTab && tabsOrder.includes(queryTab)) ? queryTab : 'info',
    tabsOrder
  );

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    changeTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (queryTab && queryTab !== activeTab && tabsOrder.includes(queryTab)) {
      changeTab(queryTab);
    }
  }, [queryTab]);

  const [copied, setCopied] = useState(false);
  const tabTransition = { type: 'tween', ease: 'easeOut', duration: 0.22 };

  // Queries
  const { data: venue, isLoading: loadingVenue } = useVenueDetail(venueId!);
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
          onClick={() => handleTabChange('info')}
        >
          Thông tin
          {activeTab === 'info' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
        <button
          className={`owner-venue-tab ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => handleTabChange('pricing')}
        >
          Giá & D.vụ
          {activeTab === 'pricing' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
        <button
          className={`owner-venue-tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => handleTabChange('images')}
        >
          Hình ảnh
          {activeTab === 'images' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
        <button
          className={`owner-venue-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => handleTabChange('reviews')}
        >
          Đánh giá
          {activeTab === 'reviews' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
        <button
          className={`owner-venue-tab ${activeTab === 'terms' ? 'active' : ''}`}
          onClick={() => handleTabChange('terms')}
        >
          Điều khoản
          {activeTab === 'terms' && <TabUnderline layoutId="ownerVenueTabUnderline" color="#dee4d8" height="1.5px" left={0} right={0} transition={tabTransition} />}
        </button>
      </div>

      {/* 4. Tab Content Area */}
      <div className="owner-venue-content">
        <TabContentSlider
          activeTab={activeTab}
          direction={direction}
          transition={tabTransition}
          enableSwipe={true}
          tabs={tabsOrder}
          onTabChange={handleTabChange}
        >
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
            <div className="owner-venue-pricing-tab" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => navigate(`/owner/venues/${venue.id}/edit?tab=pricing`)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Chỉnh sửa bảng giá
                </button>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                  BẢNG GIÁ SÂN
                </span>
              </div>

              {loadingPrices ? (
                <p style={{ opacity: 0.7, fontSize: 14, color: '#ffffff' }}>Đang tải bảng giá...</p>
              ) : (
                <PricingTable
                  priceRules={priceRules || []}
                  sportTypes={venue?.sportTypes || []}
                />
              )}

              <div style={{ marginTop: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    DANH SÁCH DỊCH VỤ
                  </h3>
                  <button
                    onClick={() => navigate('/owner/inventory')}
                    style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                  >
                    Xem thêm &gt;&gt;
                  </button>
                </div>

                <div style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {/* Group 1 */}
                      <tr>
                        <td colSpan={2} style={{
                          padding: '10px 12px',
                          backgroundColor: '#eaeaea',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#0f172a',
                          borderBottom: '1px solid #cbd5e1'
                        }}>
                          A cho thue
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>A 7UP</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', textAlign: 'right', fontWeight: 500, borderBottom: '1px solid #cbd5e1' }}>20.000 đ / Chai</td>
                      </tr>

                      {/* Group 2 */}
                      <tr>
                        <td colSpan={2} style={{
                          padding: '10px 12px',
                          backgroundColor: '#eaeaea',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#0f172a',
                          borderBottom: '1px solid #cbd5e1'
                        }}>
                          A máy bắn bóng
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', borderBottom: '1px solid #cbd5e1' }}>Thuê máy bắn bóng Pickleball</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', textAlign: 'right', fontWeight: 500, borderBottom: '1px solid #cbd5e1' }}>100.000 đ / Giờ</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>...</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b', textAlign: 'right' }}>...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="owner-venue-images-tab" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
            <div className="owner-venue-reviews-tab" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
            <div className="owner-venue-terms-tab" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, lineHeight: 1.5, opacity: 0.9, flex: 1 }}>
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


    </div>
  );
}
