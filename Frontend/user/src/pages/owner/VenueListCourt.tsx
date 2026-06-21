import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVenueDetail, useCourts } from '../../hooks/queries/useOwnerQueries';
import { useAddCourt, useUpdateCourt, useDeleteCourt } from '../../hooks/mutations/useOwnerMutations';
import { useSportCategories } from '../../hooks/queries/usePublicQueries';
import { FALLBACK_SPORTS } from '../../utils/sport';
import ConfirmModal from '../../components/venue/ConfirmModal';

// Helper to generate the next court name based on sequential numbering
const generateNextCourtName = (sportType: string, existingCourts: any[]) => {
  const filtered = existingCourts.filter(c => c.sportType?.toLowerCase() === sportType.toLowerCase());
  if (filtered.length === 0) {
    return 'SÂN 1';
  }
  let maxNum = 0;
  filtered.forEach(c => {
    const match = c.courtName.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  });
  return `SÂN ${maxNum + 1}`;
};

export default function VenueListCourt() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: venue, isLoading: loadingVenue } = useVenueDetail(venueId!);
  const { data: courts, isLoading: loadingCourts, refetch: refetchCourts } = useCourts(venueId!);
  const { data: sportsCategories = [] } = useSportCategories();

  const isFirstTimeSetup = !courts || courts.length === 0;

  // Mutations
  const addCourtMutation = useAddCourt();
  const updateCourtMutation = useUpdateCourt();
  const deleteCourtMutation = useDeleteCourt();

  // Local Court States
  const [localCourts, setLocalCourts] = useState<any[]>([]);
  const [deletedCourtIds, setDeletedCourtIds] = useState<string[]>([]);
  const [initialLocalCourts, setInitialLocalCourts] = useState<string>('');
  const [activePricingTab, setActivePricingTab] = useState<string>(''); // active sport type tab

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  // Popup Form States
  const [selectedSportType, setSelectedSportType] = useState('');
  const [courtNameInput, setCourtNameInput] = useState('');
  const [courtStatusInput, setCourtStatusInput] = useState<'AVAILABLE' | 'MAINTENANCE'>('AVAILABLE');

  // Inline row edit states
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editCourtName, setEditCourtName] = useState('');
  const [editCourtStatus, setEditCourtStatus] = useState<'AVAILABLE' | 'MAINTENANCE'>('AVAILABLE');

  // Set page background colors for the pricing/court sheet unconditionally
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

  // Initialize local courts
  useEffect(() => {
    if (venue && courts) {
      if (courts.length > 0) {
        setLocalCourts(courts);
        if (!initialLocalCourts) {
          setInitialLocalCourts(JSON.stringify(courts));
        }
      } else {
        // Create default courts based on venue.venueScale
        const defaultSport = (venue.sportTypes && venue.sportTypes.length > 0) ? venue.sportTypes[0] : 'Cầu lông';
        const defaultCourts = Array.from({ length: venue.venueScale || 1 }, (_, i) => ({
          id: `temp_${i}`,
          courtName: `SÂN ${i + 1}`,
          sportType: defaultSport,
          status: 'AVAILABLE'
        }));
        setLocalCourts(defaultCourts);
        if (!initialLocalCourts) {
          setInitialLocalCourts(JSON.stringify(defaultCourts));
        }
      }
    }
  }, [courts, venue, initialLocalCourts]);

  // Set default active tab
  useEffect(() => {
    if (venue && !activePricingTab) {
      const defaultSport = (venue.sportTypes && venue.sportTypes.length > 0) ? venue.sportTypes[0] : 'Cầu lông';
      setActivePricingTab(defaultSport);
    }
  }, [venue, activePricingTab]);

  // Handle open modal
  const openAddCourtModal = () => {
    const defaultSport = activePricingTab || (venue?.sportTypes && venue.sportTypes.length > 0 ? venue.sportTypes[0] : 'Cầu lông');
    setSelectedSportType(defaultSport);
    const autoName = generateNextCourtName(defaultSport, localCourts);
    setCourtNameInput(autoName);
    setCourtStatusInput('AVAILABLE');
    setIsAddModalOpen(true);
  };

  // Auto-generate name when sport type changes in modal
  useEffect(() => {
    if (isAddModalOpen && selectedSportType) {
      const autoName = generateNextCourtName(selectedSportType, localCourts);
      setCourtNameInput(autoName);
    }
  }, [selectedSportType, isAddModalOpen]);

  const handleConfirmAddCourt = () => {
    if (!courtNameInput.trim()) {
      alert('Vui lòng nhập tên sân');
      return;
    }
    const newCourt = {
      id: `temp_${Date.now()}_${Math.random()}`,
      courtName: courtNameInput.trim(),
      sportType: selectedSportType,
      status: courtStatusInput
    };
    setLocalCourts(prev => [...prev, newCourt]);
    setActivePricingTab(selectedSportType); // switch to the added sport type
    setIsAddModalOpen(false);
  };

  // Row editing functions
  const startEditCourt = (court: any) => {
    setEditingCourtId(court.id);
    setEditCourtName(court.courtName);
    setEditCourtStatus(court.status);
  };

  const handleUpdateCourtRow = (courtId: string) => {
    if (!editCourtName.trim()) {
      alert('Vui lòng nhập tên sân');
      return;
    }
    setLocalCourts(prev => prev.map(c => c.id === courtId ? { ...c, courtName: editCourtName, status: editCourtStatus } : c));
    setEditingCourtId(null);
  };

  const handleDeleteCourt = (courtId: string, courtName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sân "${courtName}"? Hành động này sẽ xóa vĩnh viễn sân khỏi hệ thống và có thể ảnh hưởng đến lịch đặt sân liên quan.`)) {
      if (!String(courtId).startsWith('temp_')) {
        setDeletedCourtIds(prev => [...prev, courtId]);
      }
      setLocalCourts(prev => prev.filter(c => c.id !== courtId));
    }
  };

  // Batch save to backend
  const handleSaveAllCourts = async () => {
    try {
      const originalList = courts ? JSON.parse(initialLocalCourts) : [];

      // Delete courts first
      for (const courtId of deletedCourtIds) {
        await deleteCourtMutation.mutateAsync({
          venueId: venueId!,
          courtId
        });
      }

      // Find new courts to add
      const toAdd = localCourts.filter(c => String(c.id).startsWith('temp_'));

      // Find modified courts to update
      const toUpdate = localCourts.filter(c => {
        if (String(c.id).startsWith('temp_')) return false;
        const orig = originalList.find((o: any) => o.id === c.id);
        if (!orig) return false;
        return orig.courtName !== c.courtName || orig.status !== c.status || orig.sportType !== c.sportType;
      });

      // Add courts
      for (const c of toAdd) {
        await addCourtMutation.mutateAsync({
          venueId: venueId!,
          data: {
            courtName: c.courtName,
            status: c.status || 'AVAILABLE',
            sportType: c.sportType
          }
        });
      }

      // Update courts
      for (const c of toUpdate) {
        await updateCourtMutation.mutateAsync({
          venueId: venueId!,
          courtId: c.id,
          data: {
            courtName: c.courtName,
            status: c.status,
            sportType: c.sportType
          }
        });
      }

      alert('Đã lưu cấu hình danh sách sân thành công!');
      setDeletedCourtIds([]); // Clear deleted courts tracker
      refetchCourts();
      setInitialLocalCourts(JSON.stringify(localCourts));
      navigate(`/owner/venues/${venueId}?tab=pricing`);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi lưu danh sách sân');
    }
  };

  const handleBackClick = () => {
    const hasUnsavedChanges = (JSON.stringify(localCourts) !== initialLocalCourts) || deletedCourtIds.length > 0 || isFirstTimeSetup;
    if (hasUnsavedChanges) {
      setIsBackModalOpen(true);
    } else {
      navigate(`/owner/venues/${venueId}?tab=pricing`);
    }
  };

  if (loadingVenue || loadingCourts) {
    return (
      <div className="owner-venue-detail-page owner-pricing-loading-screen">
        <p>Đang tải dữ liệu cấu hình...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="owner-venue-detail-page owner-pricing-loading-screen">
        <p>Không tìm thấy thông tin cơ sở.</p>
      </div>
    );
  }

  // Get dynamic tabs (configured in venue + any added in localCourts)
  const tabs = Array.from(new Set([
    ...(venue.sportTypes || []),
    ...localCourts.map(c => c.sportType).filter(Boolean)
  ]));

  const activeTabCourts = localCourts.filter(c => c.sportType === activePricingTab);
  const sports = sportsCategories.length > 0 ? sportsCategories : FALLBACK_SPORTS;

  return (
    <div className="owner-venue-detail-page">
      <div className="owner-pricing-content">
        {/* Custom PWA Header */}
        <div className="owner-pricing-header">
          <button onClick={handleBackClick} className="owner-pricing-back-btn">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="owner-pricing-title-text">Danh sách sân thể thao</span>
          <div style={{ width: '28px' }}></div>
        </div>

        {isFirstTimeSetup && (
          <div className="owner-courts-setup-warning">
            <strong>Lưu ý quan trọng:</strong> Sân con của cơ sở hiện chưa được lưu trên hệ thống. Dưới đây là gợi ý thiết lập mặc định dựa trên quy mô sân khi đăng ký ({venue?.venueScale} sân). Bạn <strong>bắt buộc phải bấm nút LƯU</strong> ở cuối trang để chính thức lưu thông tin và cho phép khách đặt lịch trực tuyến!
          </div>
        )}

        {/* Custom Tab buttons */}
        <div className="owner-pricing-tabs" style={{ marginBottom: '10px' }}>
          <button onClick={openAddCourtModal} className="owner-pricing-tab-btn-dotted">
            Thêm sân <span className="owner-pricing-tabs-add-icon">+</span>
          </button>
          {tabs.map((sportType) => {
            const count = localCourts.filter(c => c.sportType === sportType).length;
            return (
              <button
                key={sportType}
                onClick={() => setActivePricingTab(sportType)}
                className={activePricingTab === sportType ? "owner-pricing-tab-btn-active" : "owner-pricing-tab-btn-dotted"}
              >
                {sportType} ({count})
              </button>
            );
          })}
        </div>

        {/* Target Group */}
        <div className="owner-pricing-section">
          <div className="owner-pricing-section-title">Tổng số loại sân thể thao: {tabs.length}</div>
          <div className="owner-pricing-section-subtitle">Tổng số sân hiện tại: {localCourts.length}</div>
        </div>

        {/* Court list table */}
        <div className="owner-pricing-card owner-courts-card">
          <div className="owner-pricing-card-header">
            <span className="owner-pricing-card-sport-title">Danh sách sân: {activePricingTab}</span>
          </div>

          <div className="owner-pricing-table-wrapper">
            <table className="owner-pricing-table">
              <thead>
                <tr>
                  <th className="owner-courts-th-name">Tên sân</th>
                  <th className="owner-courts-th-status">Trạng thái</th>
                  <th className="owner-courts-th-action">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activeTabCourts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="owner-courts-td-empty">
                      Chưa có sân nào thuộc loại này. Nhấp "Thêm sân" để tạo mới.
                    </td>
                  </tr>
                ) : (
                  activeTabCourts.map((court) => {
                    const isEditing = editingCourtId === court.id;
                    return (
                      <tr key={court.id}>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editCourtName}
                              onChange={(e) => setEditCourtName(e.target.value)}
                              className="owner-pricing-input-number owner-courts-edit-input"
                            />
                          ) : (
                            <span className="owner-courts-name-text">{court.courtName}</span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              value={editCourtStatus}
                              onChange={(e) => setEditCourtStatus(e.target.value as any)}
                              className="owner-pricing-input-time owner-courts-edit-select"
                            >
                              <option value="AVAILABLE">Hoạt động</option>
                              <option value="MAINTENANCE">Bảo trì</option>
                            </select>
                          ) : (
                            <span className={`status-badge ${court.status === 'AVAILABLE' ? 'status-available' : 'status-maintenance'}`}>
                              {court.status === 'AVAILABLE' ? 'Hoạt động' : 'Bảo trì'}
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="owner-courts-actions-cell">
                              <button
                                onClick={() => handleUpdateCourtRow(court.id)}
                                className="owner-pricing-action-btn btn-action-save"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingCourtId(null)}
                                className="owner-pricing-action-btn btn-action-cancel"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="owner-courts-actions-cell">
                              <button
                                onClick={() => startEditCourt(court)}
                                className="owner-pricing-action-btn btn-action-edit"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteCourt(court.id, court.courtName)}
                                className="owner-pricing-action-btn btn-action-delete"
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Save Button - Flowing layout */}
        <div className="owner-pricing-save-container owner-courts-save-container">
          <button
            onClick={handleSaveAllCourts}
            className="owner-pricing-save-btn"
          >
            LƯU
          </button>
        </div>
      </div>

      {/* Add Court Modal */}
      {isAddModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal-container">
            <h3 className="owner-modal-title">Thêm sân con mới</h3>
            
            <div className="owner-modal-field">
              <label className="owner-modal-label">Loại sân thể thao</label>
              <select
                value={selectedSportType}
                onChange={(e) => setSelectedSportType(e.target.value)}
                className="owner-modal-select"
              >
                {sports.map((sport: any) => (
                  <option key={sport.name} value={sport.name}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="owner-modal-field">
              <label className="owner-modal-label">Tên sân</label>
              <input
                type="text"
                value={courtNameInput}
                onChange={(e) => setCourtNameInput(e.target.value)}
                className="owner-modal-input"
              />
            </div>

            <div className="owner-modal-field-large">
              <label className="owner-modal-label">Trạng thái</label>
              <select
                value={courtStatusInput}
                onChange={(e) => setCourtStatusInput(e.target.value as any)}
                className="owner-modal-select"
              >
                <option value="AVAILABLE">Hoạt động</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </div>

            <div className="owner-modal-actions">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="owner-modal-btn-cancel"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddCourt}
                className="owner-modal-btn-confirm"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Warning Modal */}
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
