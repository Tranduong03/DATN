import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Check, X } from 'lucide-react';
import OwnerLayout from './OwnerLayout';
import { useVenueDetail, useCourts, usePriceRules } from '../../hooks/queries/useOwnerQueries';
import { useAddCourt, useUpdateCourt, useUpsertPriceRules } from '../../hooks/mutations/useOwnerMutations';

export default function VenueConfigPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'courts' | 'pricing'>('courts');

  // Queries
  const { data: venue, isLoading: loadingVenue } = useVenueDetail(venueId!);
  const { data: courts, isLoading: loadingCourts } = useCourts(venueId!);
  const { data: priceRules, isLoading: loadingPrices } = usePriceRules(venueId!);

  // Mutations
  const addCourtMutation = useAddCourt();
  const updateCourtMutation = useUpdateCourt();
  const upsertPricesMutation = useUpsertPriceRules();

  // Court State
  const [newCourtName, setNewCourtName] = useState('');
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editCourtName, setEditCourtName] = useState('');
  const [editCourtStatus, setEditCourtStatus] = useState('AVAILABLE');

  // Pricing State
  const [draftPrices, setDraftPrices] = useState<any[]>([]);

  // Init prices when loaded
  if (priceRules && draftPrices.length === 0 && !loadingPrices) {
    // Only init once or when reset
    setDraftPrices(priceRules);
  }

  if (loadingVenue) {
    return (
      <OwnerLayout title="Cấu hình Sân" subtitle="Đang tải dữ liệu...">
        <div className="admin-loading"><div className="admin-spinner"></div></div>
      </OwnerLayout>
    );
  }

  if (!venue) {
    return (
      <OwnerLayout title="Không tìm thấy sân">
        <p>Vui lòng quay lại danh sách sân.</p>
      </OwnerLayout>
    );
  }

  const handleAddCourt = async () => {
    if (!newCourtName.trim()) return;
    try {
      await addCourtMutation.mutateAsync({ venueId: venueId!, data: { courtName: newCourtName, status: 'AVAILABLE' } });
      setNewCourtName('');
    } catch (error) {
      console.error(error);
      alert('Lỗi thêm sân con');
    }
  };

  const handleUpdateCourt = async (courtId: string) => {
    if (!editCourtName.trim()) return;
    try {
      await updateCourtMutation.mutateAsync({
        venueId: venueId!,
        courtId,
        data: { courtName: editCourtName, status: editCourtStatus }
      });
      setEditingCourtId(null);
    } catch (error) {
      console.error(error);
      alert('Lỗi cập nhật sân con');
    }
  };

  const startEditCourt = (court: any) => {
    setEditingCourtId(court.id);
    setEditCourtName(court.courtName);
    setEditCourtStatus(court.status);
  };

  const handleSavePricing = async () => {
    try {
      await upsertPricesMutation.mutateAsync({ venueId: venueId!, data: draftPrices });
      alert('Đã lưu cấu hình giá!');
    } catch (error) {
      console.error(error);
      alert('Lỗi lưu cấu hình giá');
    }
  };

  return (
    <OwnerLayout 
      title={`Cấu hình: ${venue.name}`} 
      subtitle={`Quản lý Sân con và Bảng giá cho ${venue.name}`}
    >
      {/* Back button removed as 1 Owner = 1 Venue */}
      <div className="admin-tabs" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'courts' ? 'active' : ''}`}
          onClick={() => setActiveTab('courts')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'courts' ? '2px solid #f59e0b' : '2px solid transparent', color: activeTab === 'courts' ? '#f59e0b' : '#6b7280', fontWeight: activeTab === 'courts' ? 600 : 400, cursor: 'pointer' }}
        >
          Danh sách Sân con
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'pricing' ? '2px solid #f59e0b' : '2px solid transparent', color: activeTab === 'pricing' ? '#f59e0b' : '#6b7280', fontWeight: activeTab === 'pricing' ? 600 : 400, cursor: 'pointer' }}
        >
          Cấu hình Bảng giá
        </button>
      </div>

      {activeTab === 'courts' && (
        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>Quản lý Sân con</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                placeholder="Tên sân mới (VD: Sân 1)" 
                value={newCourtName}
                onChange={e => setNewCourtName(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              />
              <button 
                className="admin-btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#f59e0b' }}
                onClick={handleAddCourt}
                disabled={addCourtMutation.isPending}
              >
                <Plus size={16} /> Thêm sân
              </button>
            </div>
          </div>

          {loadingCourts ? (
            <p>Đang tải danh sách sân...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên sân</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courts?.map((court: any) => (
                  <tr key={court.id}>
                    <td>
                      {editingCourtId === court.id ? (
                        <input 
                          type="text" 
                          value={editCourtName} 
                          onChange={e => setEditCourtName(e.target.value)} 
                          style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                        />
                      ) : (
                        <strong>{court.courtName}</strong>
                      )}
                    </td>
                    <td>
                      {editingCourtId === court.id ? (
                        <select 
                          value={editCourtStatus} 
                          onChange={e => setEditCourtStatus(e.target.value)}
                          style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                        >
                          <option value="AVAILABLE">Hoạt động (AVAILABLE)</option>
                          <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
                        </select>
                      ) : (
                        <span className={`admin-status-badge ${court.status === 'AVAILABLE' ? 'admin-status-badge--success' : 'admin-status-badge--warning'}`}>
                          {court.status === 'AVAILABLE' ? 'Hoạt động' : 'Đang bảo trì'}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {editingCourtId === court.id ? (
                        <>
                          <button onClick={() => handleUpdateCourt(court.id)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', marginRight: 12 }}><Check size={18} /></button>
                          <button onClick={() => setEditingCourtId(null)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                        </>
                      ) : (
                        <button onClick={() => startEditCourt(court)} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {courts?.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>Chưa có sân con nào. Vui lòng thêm sân.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>Cấu hình Bảng giá</h2>
            <button 
              className="admin-btn-primary" 
              style={{ backgroundColor: '#10b981' }}
              onClick={handleSavePricing}
              disabled={upsertPricesMutation.isPending}
            >
              Lưu bảng giá
            </button>
          </div>

          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            Thêm các khung giờ và mức giá tương ứng. Nếu không chọn "Ngày trong tuần", giá sẽ áp dụng cho tất cả các ngày.
          </p>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Loại ngày</th>
                <th>Giờ bắt đầu (HH:mm)</th>
                <th>Giờ kết thúc (HH:mm)</th>
                <th>Giá (VNĐ)</th>
                <th>Ghi chú</th>
                <th>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {draftPrices.map((rule, idx) => (
                <tr key={idx}>
                  <td>
                    <select 
                      value={rule.dayOfWeek || ''} 
                      onChange={e => {
                        const newRules = [...draftPrices];
                        newRules[idx].dayOfWeek = e.target.value ? parseInt(e.target.value) : null;
                        setDraftPrices(newRules);
                      }}
                      style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                    >
                      <option value="">Tất cả các ngày</option>
                      <option value="1">Thứ 2</option>
                      <option value="2">Thứ 3</option>
                      <option value="3">Thứ 4</option>
                      <option value="4">Thứ 5</option>
                      <option value="5">Thứ 6</option>
                      <option value="6">Thứ 7</option>
                      <option value="0">Chủ nhật</option>
                    </select>
                  </td>
                  <td>
                    <input type="time" value={rule.startHour} onChange={e => {
                      const newRules = [...draftPrices];
                      newRules[idx].startHour = e.target.value;
                      setDraftPrices(newRules);
                    }} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }} />
                  </td>
                  <td>
                    <input type="time" value={rule.endHour} onChange={e => {
                      const newRules = [...draftPrices];
                      newRules[idx].endHour = e.target.value;
                      setDraftPrices(newRules);
                    }} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }} />
                  </td>
                  <td>
                    <input type="number" value={rule.price} onChange={e => {
                      const newRules = [...draftPrices];
                      newRules[idx].price = Number(e.target.value);
                      setDraftPrices(newRules);
                    }} style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc', width: 100 }} />
                  </td>
                  <td>
                    <input type="text" value={rule.description || ''} onChange={e => {
                      const newRules = [...draftPrices];
                      newRules[idx].description = e.target.value;
                      setDraftPrices(newRules);
                    }} placeholder="VD: Giờ vàng" style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }} />
                  </td>
                  <td>
                    <button onClick={() => {
                      const newRules = draftPrices.filter((_, i) => i !== idx);
                      setDraftPrices(newRules);
                    }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            onClick={() => setDraftPrices([...draftPrices, { dayOfWeek: null, startHour: '05:00', endHour: '22:00', price: 100000, description: '' }])}
            style={{ marginTop: 12, padding: '8px 16px', borderRadius: 6, border: '1px dashed #d1d5db', background: 'transparent', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={16} /> Thêm khung giá mới
          </button>
        </div>
      )}
    </OwnerLayout>
  );
}
