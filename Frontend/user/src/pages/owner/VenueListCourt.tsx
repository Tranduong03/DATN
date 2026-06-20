import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useVenueDetail, usePriceRules } from '../../hooks/queries/useOwnerQueries';
import { useUpsertPriceRules } from '../../hooks/mutations/useOwnerMutations';
import AddPricingTypeModal from '../../components/venue/AddPricingTypeModal';
import ConfirmModal from '../../components/venue/ConfirmModal';
import { formatOperatingHour, mapDefaultHoursToOperating } from '../../utils/time';

export default function VenueListCourt() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: venue, isLoading: loadingVenue } = useVenueDetail(venueId!);
  const { data: priceRules, isLoading: loadingPrices } = usePriceRules(venueId!);
  const { data: upsertPricesMutation } = { data: useUpsertPriceRules() }; // helper wrapper matching original hooks pattern
  const upsertPrices = upsertPricesMutation;

  // Grouped Pricing Table States & Helpers (Grouped by sport type)
  const [pricingData, setPricingData] = useState<Record<string, any[]>>({});
  const [initialPricingData, setInitialPricingData] = useState<string>('');
  const [activePricingTab, setActivePricingTab] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<string>('');
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  // Set page background colors for the pricing sheet unconditionally
  useEffect(() => {
    const originalBodyBg = document.body.style.backgroundColor;
    const originalHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#2b6139';
    document.documentElement.style.backgroundColor = '#2b6139';
    return () => {
      document.body.style.backgroundColor = originalBodyBg;
      document.documentElement.style.backgroundColor = originalHtmlBg;
    };
  }, []);

  // Parse and group price rules
  useEffect(() => {
    if (priceRules && !loadingPrices && venue) {
      const defaultSport = (venue.sportTypes && venue.sportTypes.length > 0) ? venue.sportTypes[0] : 'Cầu lông';
      const tempPricingData: Record<string, any[]> = {};

      if (priceRules.length > 0) {
        priceRules.forEach((rule: any) => {
          const sport = (rule.sportType && rule.sportType.trim()) || defaultSport;
          if (!tempPricingData[sport]) {
            tempPricingData[sport] = [];
          }

          const ruleStart = rule.startHour || '00:00';
          const ruleEnd = rule.endHour || '23:59';
          const { start: startStr, end: endStr } = mapDefaultHoursToOperating(
            ruleStart,
            ruleEnd,
            venue.operatingStartHour,
            venue.operatingEndHour
          );

          const key = `${startStr}_${endStr}_${rule.dayOfWeek}`;

          let row = tempPricingData[sport].find(r => r.key === key);
          if (!row) {
            row = {
              key,
              startHour: startStr,
              endHour: endStr,
              dayOfWeek: rule.dayOfWeek,
              fixedPrice: 0,
              casualPrice: 0,
              isEditing: false,
              timeDisplay: `${formatOperatingHour(startStr)} - ${formatOperatingHour(endStr)}`
            };
            tempPricingData[sport].push(row);
          }

          const desc = (rule.description || '').toLowerCase();
          if (desc.includes('cố định') || desc.includes('co dinh') || desc.includes('cố')) {
            row.fixedPrice = rule.price || 0;
          } else {
            row.casualPrice = rule.price || 0;
          }
        });
      }

      // Ensure at least the default sport tab exists
      if (!tempPricingData[defaultSport]) {
        const venueStart = venue.operatingStartHour ? venue.operatingStartHour.substring(0, 5) : '06:00';
        const venueEnd = venue.operatingEndHour ? venue.operatingEndHour.substring(0, 5) : '22:00';
        tempPricingData[defaultSport] = [
          {
            key: `${venueStart}_${venueEnd}_null`,
            startHour: venueStart,
            endHour: venueEnd,
            dayOfWeek: null,
            fixedPrice: 100000,
            casualPrice: 110000,
            isEditing: false,
            timeDisplay: `${formatOperatingHour(venueStart)} - ${formatOperatingHour(venueEnd)}`
          }
        ];
      }

      // Initialize other sports from venue if not present, copying default sport's rules
      const defaultRules = tempPricingData[defaultSport];
      if (venue.sportTypes && venue.sportTypes.length > 0) {
        venue.sportTypes.forEach((sport: string) => {
          if (sport && sport.trim() && !tempPricingData[sport]) {
            tempPricingData[sport] = JSON.parse(JSON.stringify(defaultRules));
          }
        });
      }

      setPricingData(tempPricingData);
      if (!initialPricingData) {
        setInitialPricingData(JSON.stringify(tempPricingData));
      }

      // Set active tab to defaultSport if not set or invalid
      if (!activePricingTab || !tempPricingData[activePricingTab]) {
        setActivePricingTab(defaultSport);
      }
    }
  }, [priceRules, loadingPrices, venue, venueId, initialPricingData]);



  const handleSavePricingGrouped = async () => {
    const flatRules: any[] = [];
    Object.keys(pricingData).forEach((sportType) => {
      const rows = pricingData[sportType];
      if (rows && Array.isArray(rows)) {
        rows.forEach((row) => {
          const ruleStart = row.startHour || (venue?.operatingStartHour ? venue.operatingStartHour.substring(0, 5) : '06:00');
          const ruleEnd = row.endHour || (venue?.operatingEndHour ? venue.operatingEndHour.substring(0, 5) : '22:00');
          flatRules.push({
            dayOfWeek: row.dayOfWeek,
            startHour: ruleStart.includes(':') ? `${ruleStart}:00` : ruleStart,
            endHour: ruleEnd.includes(':') ? `${ruleEnd}:00` : ruleEnd,
            price: row.fixedPrice || 0,
            description: 'Cố định',
            sportType: sportType
          });
          flatRules.push({
            dayOfWeek: row.dayOfWeek,
            startHour: ruleStart.includes(':') ? `${ruleStart}:00` : ruleStart,
            endHour: ruleEnd.includes(':') ? `${ruleEnd}:00` : ruleEnd,
            price: row.casualPrice || 0,
            description: 'Vãng lai',
            sportType: sportType
          });
        });
      }
    });

    try {
      await upsertPrices.mutateAsync({ venueId: venueId!, data: flatRules });
      alert('Đã lưu cấu hình bảng giá thành công!');
      setInitialPricingData(JSON.stringify(pricingData));
      navigate(`/owner/venues/${venueId}?tab=pricing`);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu cấu hình bảng giá');
    }
  };

  const handleAddPricingType = (name: string) => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (pricingData[trimmed]) {
      alert('Loại sân này đã tồn tại trong danh sách bảng giá.');
      return;
    }

    const venueStart = venue?.operatingStartHour ? venue.operatingStartHour.substring(0, 5) : '06:00';
    const venueEnd = venue?.operatingEndHour ? venue.operatingEndHour.substring(0, 5) : '22:00';

    const baseRules = (activePricingTab && pricingData[activePricingTab]) || Object.values(pricingData)[0] || [
      {
        key: `${venueStart}_${venueEnd}_null`,
        startHour: venueStart,
        endHour: venueEnd,
        dayOfWeek: null,
        fixedPrice: 100000,
        casualPrice: 110000,
        isEditing: false,
        timeDisplay: `${formatOperatingHour(venueStart)} - ${formatOperatingHour(venueEnd)}`
      }
    ];

    setPricingData({
      ...pricingData,
      [trimmed]: JSON.parse(JSON.stringify(baseRules))
    });
    setActivePricingTab(trimmed);
  };

  const handleDeletePricingType = (name: string) => {
    if (!name) return;
    if (Object.keys(pricingData).length <= 1) {
      alert('Không thể xóa bảng giá duy nhất còn lại.');
      return;
    }
    setTabToDelete(name);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteTab = () => {
    if (!tabToDelete) return;
    const copy = { ...pricingData };
    delete copy[tabToDelete];
    setPricingData(copy);
    setActivePricingTab(Object.keys(copy)[0] || '');
    setIsDeleteModalOpen(false);
    setTabToDelete('');
  };

  const handleBackClick = () => {
    const hasUnsavedChanges = JSON.stringify(pricingData) !== initialPricingData;
    if (hasUnsavedChanges) {
      setIsBackModalOpen(true);
    } else {
      navigate(`/owner/venues/${venueId}?tab=pricing`);
    }
  };

  if (loadingVenue || loadingPrices) {
    return (
      <div className="owner-venue-detail-page" style={{ backgroundColor: '#2b6139', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <p>Đang tải dữ liệu cấu hình...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="owner-venue-detail-page" style={{ backgroundColor: '#2b6139', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <p>Không tìm thấy thông tin cơ sở.</p>
      </div>
    );
  }

  return (
    <div className="owner-venue-detail-page">
      <div className="owner-pricing-content">
        {/* Custom PWA Header */}
        <div className="owner-pricing-header">
          <button
            onClick={handleBackClick}
            className="owner-pricing-back-btn"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="owner-pricing-title-text">Danh sách sân thể thao</span>
          <button
            onClick={() => handleDeletePricingType(activePricingTab)}
            className="owner-pricing-delete-btn"
          >
            <Trash2 size={15} color="#ef4444" />
          </button>
        </div>

        {/* Custom Tab buttons */}
        <div className="owner-pricing-tabs" style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="owner-pricing-tab-btn-dotted"
          >
            Thêm sân <span style={{ fontSize: "18px", fontWeight: "700" }}>+</span>
          </button>
          {/* TODO: CÓ THỂ THÊM TAB */}
          {Object.keys(pricingData).map((sportType) => (
            <button
              key={sportType}
              onClick={() => setActivePricingTab(sportType)}
              className={activePricingTab === sportType ? "owner-pricing-tab-btn-active" : "owner-pricing-tab-btn-dotted"}>
                {/* TODO: Hiển thị số lượng sân theo từng loại */}
              {sportType} (Số lượng sân setup sẵn)
            </button>
          ))}
        </div>

        {/* Target Group */}
        <div className="owner-pricing-section">
          <div className="owner-pricing-section-title">Tổng số loại sân thể thao: </div>
          <div className="owner-pricing-section-subtitle">Tổng số sân hiện tại: {venue.totalCourts}</div>
        </div>

        {/* TODO: HIỂN THỊ DANH SÁCH TỪNG LOẠI SÂN THỂ THAO THEO TAB */}
        {/* TO DO: THÊM VÀ QUẢN LÝ SÂN MỚI */}

       
        {/* Bottom Save Button - Flowing layout */}
        <div 
          className="owner-pricing-save-container"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '12px',
            right: '12px',
            width: 'auto',
            padding: 0,
            zIndex: 1000
          }}
        >
          <button
            onClick={handleSavePricingGrouped}
            className="owner-pricing-save-btn"
          >
            LƯU
          </button>
        </div>
      </div>
      <AddPricingTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPricingType}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTabToDelete('');
        }}
        onConfirm={handleConfirmDeleteTab}
        title="Xóa bảng giá"
        message={`Bạn xác nhận muốn xóa bảng giá "${tabToDelete}".\nThao tác này không thể khôi phục`}
        confirmText="XÓA"
        cancelText="Hủy"
      />
      <ConfirmModal
        isOpen={isBackModalOpen}
        onClose={() => setIsBackModalOpen(false)}
        onConfirm={() => {
          setIsBackModalOpen(false);
          navigate(`/owner/venues/${venue.id}?tab=pricing`);
        }}
        title="Thông báo"
        message={`Những thay đổi trước đó chưa được lưu.\nBạn vẫn muốn quay về?`}
        confirmText="OK"
        cancelText="Hủy"
      />
    </div>
  );
}
