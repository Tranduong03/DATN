import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, HelpCircle } from 'lucide-react';
import { useVenueDetail, useCourts } from '../../hooks/queries/useOwnerQueries';
import { useAddCourt, useUpdateCourt } from '../../hooks/mutations/useOwnerMutations';

export default function CreateCourtPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: venue, isLoading: loadingVenue } = useVenueDetail(venueId!);
  const { data: courts, isLoading: loadingCourts } = useCourts(venueId!);

  // Mutations
  const addCourtMutation = useAddCourt();
  const updateCourtMutation = useUpdateCourt();

  // State
  const [localCourts, setLocalCourts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Set page background color to green (#2b6139) on mount
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

  // Initialize local courts state when API data finishes loading
  useEffect(() => {
    if (courts && !loadingCourts) {
      setLocalCourts(courts.map((c: any) => ({
        ...c,
        isOriginal: true
      })));
    }
  }, [courts, loadingCourts]);

  const handleAddNewCourtLocal = () => {
    if (venue && localCourts.length >= venue.venueScale) {
      const confirmAdd = window.confirm(
        `Cơ sở của bạn đã đăng ký quy mô ${venue.venueScale} sân. Bạn có chắc chắn muốn thêm sân mới không?`
      );
      if (!confirmAdd) return;
    }

    const tempId = `temp_${Date.now()}`;
    setLocalCourts([
      ...localCourts,
      {
        id: tempId,
        courtName: `Sân ${localCourts.length + 1}`,
        sportType: venue?.sportTypes?.[0] || 'Pickleball',
        status: 'AVAILABLE',
        isOriginal: false
      }
    ]);
  };

  const updateLocalCourtField = (id: string, field: string, value: any) => {
    setLocalCourts(localCourts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveCourtLocal = (id: string) => {
    const court = localCourts.find(c => c.id === id);
    if (!court) return;

    if (court.isOriginal) {
      alert('Hệ thống chưa hỗ trợ xóa sân đã lưu. Bạn có thể thay đổi trạng thái sang "Bảo trì" để dừng đặt sân.');
      return;
    }

    setLocalCourts(localCourts.filter(c => c.id !== id));
  };

  const handleSave = async () => {
    const hasEmptyName = localCourts.some(c => !c.courtName.trim());
    if (hasEmptyName) {
      alert('Tên sân không được để trống.');
      return;
    }

    try {
      setIsSaving(true);

      for (const court of localCourts) {
        if (!court.isOriginal) {
          // Add new court to DB
          await addCourtMutation.mutateAsync({
            venueId: venueId!,
            data: {
              courtName: court.courtName,
              status: court.status,
              sportType: court.sportType
            }
          });
        } else {
          // Update modified courts
          const original = courts.find((o: any) => o.id === court.id);
          const isModified = original && (
            original.courtName !== court.courtName ||
            original.status !== court.status ||
            original.sportType !== court.sportType
          );

          if (isModified) {
            await updateCourtMutation.mutateAsync({
              venueId: venueId!,
              courtId: court.id,
              data: {
                courtName: court.courtName,
                status: court.status,
                sportType: court.sportType
              }
            });
          }
        }
      }

      alert('Đã cập nhật danh sách sân con thành công!');
      navigate(`/owner/venues/${venueId}?tab=pricing`);
    } catch (err: any) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu thông tin sân con.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingVenue || loadingCourts) {
    return (
      <div style={{
        backgroundColor: '#2b6139',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16
      }}>
        <div className="admin-spinner" style={{ borderColor: '#ffffff', borderTopColor: 'transparent' }}></div>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>Đang tải dữ liệu sân con...</p>
      </div>
    );
  }

  return (
    <div className="owner-pricing-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header (Reused component from pricing table edit screen) */}
      <div className="owner-pricing-header">
        <button
          onClick={() => navigate(`/owner/venues/${venueId}?tab=pricing`)}
          className="owner-pricing-back-btn"
        >
          <ChevronLeft size={24} color="#ffffff" />
        </button>
        <span className="owner-pricing-title-text">Danh sách sân</span>
        <button
          onClick={() => {
            alert('Để xóa sân con đã lưu, vui lòng chuyển trạng thái sân sang "Bảo trì".');
          }}
          className="owner-pricing-delete-btn"
          style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
        >
          <HelpCircle size={15} color="#ffffff" />
        </button>
      </div>

      {/* 2. Custom Tabs buttons (Reused component from pricing table edit screen) */}
      <div className="owner-pricing-tabs">
        <button
          onClick={() => navigate(`/owner/venues/${venueId}/edit?tab=pricing`)}
          className="owner-pricing-tab-btn-dotted"
        >
          Bảng giá sân ✏️
        </button>
        <button className="owner-pricing-tab-btn-active">
          Danh sách sân con 🏠
        </button>
      </div>

      {/* 3. Main Card Container (Reused styling from pricing table card) */}
      <div style={{ flex: 1 }}>
        <div className="owner-pricing-section-title" style={{ marginBottom: 12 }}>
          Quản lý sân con ({localCourts.length} sân)
        </div>

        <div className="owner-pricing-card" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <div className="owner-pricing-card-header" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
              Quy mô cơ sở: {venue?.venueScale || 0} sân
            </span>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="owner-pricing-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingLeft: '16px' }}>Tên sân</th>
                  <th>Môn thể thao</th>
                  <th>Trạng thái</th>
                  <th style={{ width: '44px' }}></th>
                </tr>
              </thead>
              <tbody>
                {localCourts.length > 0 ? (
                  localCourts.map((court) => (
                    <tr key={court.id}>
                      <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                        <input
                          type="text"
                          value={court.courtName}
                          onChange={e => updateLocalCourtField(court.id, 'courtName', e.target.value)}
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            fontWeight: 600,
                            width: '100%',
                            maxWidth: '120px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            outline: 'none',
                            color: '#1e293b'
                          }}
                          placeholder="Tên sân"
                        />
                      </td>
                      <td>
                        <select
                          value={court.sportType || ''}
                          onChange={e => updateLocalCourtField(court.id, 'sportType', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            outline: 'none',
                            backgroundColor: '#ffffff',
                            color: '#1e293b',
                            cursor: 'pointer'
                          }}
                        >
                          {venue?.sportTypes?.map((sport: string) => (
                            <option key={sport} value={sport}>
                              {sport}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={court.status}
                          onChange={e => updateLocalCourtField(court.id, 'status', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            outline: 'none',
                            backgroundColor: '#ffffff',
                            color: '#1e293b',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="AVAILABLE">Hoạt động</option>
                          <option value="MAINTENANCE">Bảo trì</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveCourtLocal(court.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%'
                          }}
                          title="Xóa sân con"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', color: '#64748b', fontSize: '13px' }}>
                      Chưa có sân con nào. Vui lòng nhấn nút bên dưới để thêm mới.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Dotted button inside card (Reused component from pricing table edit screen) */}
          <button
            onClick={handleAddNewCourtLocal}
            className="owner-pricing-card-dotted-btn"
            style={{ fontWeight: 700 }}
          >
            + Thêm sân mới
          </button>
        </div>
      </div>

      {/* 4. Bottom Save Button (Reused component from pricing table edit screen) */}
      <div className="owner-pricing-save-container">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="owner-pricing-save-btn"
        >
          {isSaving ? 'ĐANG LƯU...' : 'LƯU'}
        </button>
      </div>
    </div>
  );
}
