import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Edit2, Check } from 'lucide-react';
import { useVenueDetail, usePriceRules } from '../../hooks/queries/useOwnerQueries';
import { useUpsertPriceRules } from '../../hooks/mutations/useOwnerMutations';
import AddPricingTypeModal from '../../components/venue/AddPricingTypeModal';
import ConfirmModal from '../../components/venue/ConfirmModal';

export default function VenuePricePage() {
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
          const startStr = ruleStart.substring(0, 5);
          const endStr = ruleEnd.substring(0, 5);
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
              timeDisplay: startStr.startsWith('00') && (endStr.startsWith('23:59') || endStr.startsWith('24:00')) ? 'Mặc định' : `${startStr} - ${endStr}`
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
        tempPricingData[defaultSport] = [
          {
            key: '00:00_23:59_null',
            startHour: '00:00',
            endHour: '23:59',
            dayOfWeek: null,
            fixedPrice: 100000,
            casualPrice: 110000,
            isEditing: false,
            timeDisplay: 'Mặc định'
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

  const editGroupRow = (idx: number) => {
    if (!activePricingTab || !pricingData[activePricingTab]) return;
    const updated = pricingData[activePricingTab].map((r, i) => i === idx ? { ...r, isEditing: true } : r);
    setPricingData({ ...pricingData, [activePricingTab]: updated });
  };

  const updateGroupRow = (idx: number, field: string, value: any) => {
    if (!activePricingTab || !pricingData[activePricingTab]) return;
    const updated = pricingData[activePricingTab].map((r, i) => {
      if (i === idx) {
        const u = { ...r, [field]: value };
        if (field === 'startHour' || field === 'endHour') {
          u.timeDisplay = u.startHour === '00:00' && (u.endHour === '23:59' || u.endHour === '24:00') ? 'Mặc định' : `${u.startHour} - ${u.endHour}`;
        }
        return u;
      }
      return r;
    });
    setPricingData({ ...pricingData, [activePricingTab]: updated });
  };

  const saveGroupRow = (idx: number) => {
    if (!activePricingTab || !pricingData[activePricingTab]) return;
    const updated = pricingData[activePricingTab].map((r, i) => i === idx ? { ...r, isEditing: false } : r);
    setPricingData({ ...pricingData, [activePricingTab]: updated });
  };

  const deleteGroupRow = (idx: number) => {
    if (!activePricingTab || !pricingData[activePricingTab]) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) {
      const updated = pricingData[activePricingTab].filter((_, i) => i !== idx);
      setPricingData({ ...pricingData, [activePricingTab]: updated });
    }
  };

  const addNewGroupRow = () => {
    if (!activePricingTab || !pricingData[activePricingTab]) return;
    const updated = [
      ...pricingData[activePricingTab],
      {
        key: `new_${Date.now()}`,
        startHour: '17:00',
        endHour: '22:00',
        dayOfWeek: null,
        fixedPrice: 120000,
        casualPrice: 130000,
        isEditing: true,
        timeDisplay: '17:00 - 22:00'
      }
    ];
    setPricingData({ ...pricingData, [activePricingTab]: updated });
  };

  const handleSavePricingGrouped = async () => {
    const flatRules: any[] = [];
    Object.keys(pricingData).forEach((sportType) => {
      const rows = pricingData[sportType];
      if (rows && Array.isArray(rows)) {
        rows.forEach((row) => {
          const ruleStart = row.startHour || '00:00';
          const ruleEnd = row.endHour || '23:59';
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

    const baseRules = (activePricingTab && pricingData[activePricingTab]) || Object.values(pricingData)[0] || [
      {
        key: '00:00_23:59_null',
        startHour: '00:00',
        endHour: '23:59',
        dayOfWeek: null,
        fixedPrice: 100000,
        casualPrice: 110000,
        isEditing: false,
        timeDisplay: 'Mặc định'
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

  const handleRenamePricingType = (oldName: string) => {
    if (!oldName) return;
    const newName = prompt('Nhập tên mới cho loại sân / bảng giá:', oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    const trimmed = newName.trim();
    if (pricingData[trimmed]) {
      alert('Tên loại sân này đã tồn tại.');
      return;
    }
    const copy = { ...pricingData };
    copy[trimmed] = copy[oldName];
    delete copy[oldName];
    setPricingData(copy);
    if (activePricingTab === oldName) {
      setActivePricingTab(trimmed);
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
          <span className="owner-pricing-title-text">Chỉnh sửa bảng giá sân</span>
          <button
            onClick={() => handleDeletePricingType(activePricingTab)}
            className="owner-pricing-delete-btn"
          >
            <Trash2 size={15} color="#ef4444" />
          </button>
        </div>

        {/* Custom Tab buttons */}
        <div className="owner-pricing-tabs">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="owner-pricing-tab-btn-dotted"
          >
            Thêm loại sân +
          </button>
          {Object.keys(pricingData).map((sportType) => (
            <button
              key={sportType}
              onClick={() => setActivePricingTab(sportType)}
              className={activePricingTab === sportType ? "owner-pricing-tab-btn-active" : "owner-pricing-tab-btn-dotted"}>
              {sportType}
            </button>
          ))}
        </div>

        {/* Target Group */}
        <div className="owner-pricing-section">
          <div className="owner-pricing-section-title">Sân áp dụng</div>
          <div className="owner-pricing-section-subtitle">Khung giờ bắt buộc</div>
          <button
            onClick={() => alert('Chức năng cấu hình khung giờ bắt buộc sẽ sớm khả dụng.')}
            className="owner-pricing-under-card-dotted-btn"
            style={{ marginTop: 0 }}
          >
            + Thêm khung giờ
          </button>
        </div>

        {/* Table Container */}
        <div className="owner-pricing-table-container">
          <div className="owner-pricing-section-title owner-pricing-section-title-margin">Bảng giá</div>

          {/* White card container */}
          <div className="owner-pricing-card">
            {/* Card Header */}
            <div className="owner-pricing-card-header">
              <div className="owner-pricing-card-arrows">
                <span>↑</span>
                <span>↓</span>
              </div>
              <div className="owner-pricing-card-sport-title">
                {'Mặc định'}
              </div>
              <div className="owner-pricing-card-actions">
                <span title="Chỉnh sửa tên bảng giá này" onClick={() => handleRenamePricingType(activePricingTab)}><Edit2 size={16} color="#475569" /></span>
                <span title="Xóa toàn bộ bảng giá này" onClick={() => handleDeletePricingType(activePricingTab)}><Trash2 size={16} color="#ef4444" /></span>
              </div>
            </div>

            {/* Notice row */}
            <div className="owner-pricing-card-notice">
              <span>👤 Đang hiển thị bảng giá với khách chơi</span>
            </div>

            {/* Table wrapper for horizontal scrollability */}
            <div className="owner-pricing-table-wrapper">
              <table className="owner-pricing-table">
                <thead>
                  <tr>
                    <th>Khung giờ</th>
                    <th>Cố định</th>
                    <th>Vãng lai</th>
                    <th className="owner-pricing-th-action"></th>
                    <th className="owner-pricing-th-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {(pricingData[activePricingTab] || []).map((row, idx) => (
                    <tr key={row.key || idx}>
                      <td>
                        {row.isEditing ? (
                          <div className="owner-pricing-time-inputs-container">
                            <input
                              type="time"
                              value={row.startHour}
                              onChange={e => updateGroupRow(idx, 'startHour', e.target.value)}
                              className="owner-pricing-input-time"
                            />
                            <input
                              type="time"
                              value={row.endHour}
                              onChange={e => updateGroupRow(idx, 'endHour', e.target.value)}
                              className="owner-pricing-input-time"
                            />
                          </div>
                        ) : (
                          row.timeDisplay
                        )}
                      </td>
                      <td>
                        {row.isEditing ? (
                          <input
                            type="number"
                            value={row.fixedPrice}
                            onChange={e => updateGroupRow(idx, 'fixedPrice', Number(e.target.value))}
                            className="owner-pricing-input-number"
                          />
                        ) : (
                          `${(row.fixedPrice || 0).toLocaleString('vi-VN')} đ`
                        )}
                      </td>
                      <td>
                        {row.isEditing ? (
                          <input
                            type="number"
                            value={row.casualPrice}
                            onChange={e => updateGroupRow(idx, 'casualPrice', Number(e.target.value))}
                            className="owner-pricing-input-number"
                          />
                        ) : (
                          `${(row.casualPrice || 0).toLocaleString('vi-VN')} đ`
                        )}
                      </td>
                      <td className="owner-pricing-td-action">
                        {row.isEditing ? (
                          <button
                            onClick={() => saveGroupRow(idx)}
                            className="owner-pricing-action-btn"
                            title="Lưu dòng này"
                          >
                            <Check size={18} color="#10b981" />
                          </button>
                        ) : (
                          <button
                            onClick={() => editGroupRow(idx)}
                            className="owner-pricing-action-btn"
                            title="Sửa dòng này"
                          >
                            <Edit2 size={16} color="#2b6139" />
                          </button>
                        )}
                      </td>
                      <td className="owner-pricing-td-action">
                        <button
                          onClick={() => deleteGroupRow(idx)}
                          className="owner-pricing-action-btn"
                          title="Xóa dòng này"
                        >
                          <Trash2 size={18} color="#ef4444" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dotted button inside card */}
            <button
              onClick={addNewGroupRow}
              className="owner-pricing-card-dotted-btn"
            >
              + Thêm khung giờ
            </button>
          </div>

          {/* Dotted button under card */}
          <button
            onClick={() => alert('Chức năng thêm đối tượng sẽ sớm khả dụng.')}
            className="owner-pricing-under-card-dotted-btn"
          >
            + Thêm đối tượng
          </button>
        </div>

        {/* Bottom Save Button - Flowing layout */}
        <div className="owner-pricing-save-container">
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
