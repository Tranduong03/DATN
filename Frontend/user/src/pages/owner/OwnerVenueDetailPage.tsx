import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { useVenueDetail, usePriceRules, useCourts } from '../../hooks/queries/useOwnerQueries';
import { useTabDirection, TabUnderline, TabContentSlider } from '../../components/ui/AnimatedTabs';
import { InfoTab, PricingTab, ImagesTab, ReviewsTab, TermsTab } from '../../components/venue';
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
  const { data: courts, isLoading: loadingCourts } = useCourts(venueId!);

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
            <InfoTab
              venue={venue}
              isOwner={true}
              copied={copied}
              onCopyLink={handleCopyLink}
              onlineLink={`${window.location.origin}/venue/${venue.id}`}
              onEditInfo={() => navigate(`/owner/venues/${venue.id}/edit?tab=info`)}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingTab
              venue={venue}
              priceRules={priceRules || []}
              loadingPrices={loadingPrices}
              courts={courts || []}
              loadingCourts={loadingCourts}
              isOwner={true}
              onEditPricing={() => navigate(`/owner/venues/${venue.id}/edit?tab=pricing`)}
              onViewInventory={() => navigate('/owner/inventory')}
              onViewCourts={() => navigate(`/owner/venues/${venue.id}/edit?tab=courts`)}
            />
          )}

          {activeTab === 'images' && (
            <ImagesTab
              images={venue.images || []}
              isOwner={true}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              venue={venue}
              isOwner={true}
            />
          )}

          {activeTab === 'terms' && (
            <TermsTab
              isOwner={true}
            />
          )}
        </TabContentSlider>
      </div>


    </div>
  );
}
