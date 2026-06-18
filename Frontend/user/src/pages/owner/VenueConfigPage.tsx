import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Check, X, Trash2, Image, Camera, Save, Globe, Phone, MapPin, Clock, Eye } from 'lucide-react';
import OwnerLayout from './OwnerLayout';
import { useVenueDetail, useCourts, usePriceRules } from '../../hooks/queries/useOwnerQueries';
import { useAddCourt, useUpdateCourt, useUpsertPriceRules, useUpdateVenue, useAddVenueImage, useDeleteVenueImage } from '../../hooks/mutations/useOwnerMutations';

export default function VenueConfigPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab') as 'courts' | 'pricing' | 'profile' | null;
  const [activeTab, setActiveTab] = useState<'courts' | 'pricing' | 'profile'>('courts');

  useEffect(() => {
    if (tabParam && ['courts', 'pricing', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Queries
  const { data: venue, isLoading: loadingVenue } = useVenueDetail(venueId!);
  const { data: courts, isLoading: loadingCourts } = useCourts(venueId!);
  const { data: priceRules, isLoading: loadingPrices } = usePriceRules(venueId!);

  // Mutations
  const addCourtMutation = useAddCourt();
  const updateCourtMutation = useUpdateCourt();
  const upsertPricesMutation = useUpsertPriceRules();
  const updateVenueMutation = useUpdateVenue();
  const addVenueImageMutation = useAddVenueImage();
  const deleteVenueImageMutation = useDeleteVenueImage();

  // Court State
  const [newCourtName, setNewCourtName] = useState('');
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editCourtName, setEditCourtName] = useState('');
  const [editCourtStatus, setEditCourtStatus] = useState('AVAILABLE');



  // Venue Profile State
  const [profileName, setProfileName] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [profileStart, setProfileStart] = useState('06:00');
  const [profileEnd, setProfileEnd] = useState('22:00');
  const [profileQr, setProfileQr] = useState('');
  const [profileSports, setProfileSports] = useState<string[]>([]);
  
  // Image addition state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageType, setNewImageType] = useState<'Avatar' | 'Gallery'>('Gallery');

  // Grouped Pricing Table States & Helpers
  const [groupedRows, setGroupedRows] = useState<any[]>([]);

  useEffect(() => {
    if (priceRules && !loadingPrices) {
      if (priceRules.length > 0) {
        const tempGroups: Record<string, any> = {};
        priceRules.forEach((rule: any) => {
          const key = `${rule.startHour.substring(0, 5)}_${rule.endHour.substring(0, 5)}_${rule.dayOfWeek}`;
          if (!tempGroups[key]) {
            tempGroups[key] = {
              startHour: rule.startHour.substring(0, 5),
              endHour: rule.endHour.substring(0, 5),
              dayOfWeek: rule.dayOfWeek,
              fixedPrice: 0,
              casualPrice: 0,
              isEditing: false,
              timeDisplay: rule.startHour.startsWith('00') && (rule.endHour.startsWith('23:59') || rule.endHour.startsWith('24:00')) ? 'Mặc định' : `${rule.startHour.substring(0, 5)} - ${rule.endHour.substring(0, 5)}`
            };
          }
          const desc = (rule.description || '').toLowerCase();
          if (desc.includes('cố định') || desc.includes('co dinh') || desc.includes('cố')) {
            tempGroups[key].fixedPrice = rule.price;
          } else {
            tempGroups[key].casualPrice = rule.price;
          }
        });
        setGroupedRows(Object.values(tempGroups));
      } else {
        // Automatically save default rules to database if not present
        const defaultRules = [
          {
            dayOfWeek: null,
            startHour: '00:00:00',
            endHour: '23:59:00',
            price: 100000,
            description: 'Cố định'
          },
          {
            dayOfWeek: null,
            startHour: '00:00:00',
            endHour: '23:59:00',
            price: 110000,
            description: 'Vãng lai'
          }
        ];
        
        upsertPricesMutation.mutate({ venueId: venueId!, data: defaultRules });

        setGroupedRows([
          {
            startHour: '00:00',
            endHour: '23:59',
            dayOfWeek: null,
            fixedPrice: 100000,
            casualPrice: 110000,
            isEditing: false,
            timeDisplay: 'Mặc định'
          }
        ]);
      }
    }
  }, [priceRules, loadingPrices, venueId]);

  const editGroupRow = (idx: number) => {
    setGroupedRows(groupedRows.map((r, i) => i === idx ? { ...r, isEditing: true } : r));
  };

  const updateGroupRow = (idx: number, field: string, value: any) => {
    setGroupedRows(groupedRows.map((r, i) => {
      if (i === idx) {
        const updated = { ...r, [field]: value };
        if (field === 'startHour' || field === 'endHour') {
          updated.timeDisplay = updated.startHour === '00:00' && (updated.endHour === '23:59' || updated.endHour === '24:00') ? 'Mặc định' : `${updated.startHour} - ${updated.endHour}`;
        }
        return updated;
      }
      return r;
    }));
  };

  const saveGroupRow = (idx: number) => {
    setGroupedRows(groupedRows.map((r, i) => i === idx ? { ...r, isEditing: false } : r));
  };

  const deleteGroupRow = (idx: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) {
      setGroupedRows(groupedRows.filter((_, i) => i !== idx));
    }
  };

  const addNewGroupRow = () => {
    setGroupedRows([
      ...groupedRows,
      {
        startHour: '17:00',
        endHour: '22:00',
        dayOfWeek: null,
        fixedPrice: 120000,
        casualPrice: 130000,
        isEditing: true,
        timeDisplay: '17:00 - 22:00'
      }
    ]);
  };

  const handleSavePricingGrouped = async () => {
    const flatRules: any[] = [];
    groupedRows.forEach((row) => {
      flatRules.push({
        dayOfWeek: row.dayOfWeek,
        startHour: row.startHour.includes(':') ? `${row.startHour}:00` : row.startHour,
        endHour: row.endHour.includes(':') ? `${row.endHour}:00` : row.endHour,
        price: row.fixedPrice,
        description: 'Cố định'
      });
      flatRules.push({
        dayOfWeek: row.dayOfWeek,
        startHour: row.startHour.includes(':') ? `${row.startHour}:00` : row.startHour,
        endHour: row.endHour.includes(':') ? `${row.endHour}:00` : row.endHour,
        price: row.casualPrice,
        description: 'Vãng lai'
      });
    });

    try {
      await upsertPricesMutation.mutateAsync({ venueId: venueId!, data: flatRules });
      alert('Đã lưu cấu hình bảng giá thành công!');
      navigate(`/owner/venues/${venueId}?tab=pricing`);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu cấu hình bảng giá');
    }
  };

  // Init profile when loaded
  useEffect(() => {
    if (venue) {
      setProfileName(venue.name || '');
      setProfileAddress(venue.address || '');
      setProfilePhone(venue.contactPhone || '');
      setProfileDesc(venue.description || '');
      setProfileStart(venue.operatingStartHour || '06:00');
      setProfileEnd(venue.operatingEndHour || '22:00');
      setProfileQr(venue.bankQrUrl || '');
      setProfileSports(venue.sportTypes || []);
    }
  }, [venue]);

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

    if (courts && courts.length >= venue.venueScale) {
      const confirmAdd = window.confirm(`Cơ sở của bạn ban đầu chỉ đăng ký ${venue.venueScale} sân. Bạn có chắc chắn muốn thêm sân mới và cập nhật lại quy mô không?`);
      if (!confirmAdd) return;
    }

    try {
      await addCourtMutation.mutateAsync({ venueId: venueId!, data: { courtName: newCourtName, status: 'AVAILABLE' } });
      setNewCourtName('');
    } catch (error) {
      console.error(error);
      alert('Lỗi thêm sân con');
    }
  };

  const handleAutoInitCourts = async () => {
    if (courts && courts.length === 0 && venue) {
      const confirmInit = window.confirm(`Bạn có muốn tự động khởi tạo ${venue.venueScale} sân mẫu không?`);
      if (!confirmInit) return;
      
      try {
        for (let i = 1; i <= venue.venueScale; i++) {
          await addCourtMutation.mutateAsync({ venueId: venueId!, data: { courtName: `Sân ${i}`, status: 'AVAILABLE' } });
        }
      } catch (e) {
        console.error(e);
        alert('Có lỗi khi khởi tạo tự động');
      }
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



  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      alert('Vui lòng nhập tên cơ sở!');
      return;
    }
    if (!profileAddress.trim()) {
      alert('Vui lòng nhập địa chỉ!');
      return;
    }
    try {
      await updateVenueMutation.mutateAsync({
        venueId: venueId!,
        data: {
          name: profileName,
          address: profileAddress,
          description: profileDesc,
          contactPhone: profilePhone,
          bankQrUrl: profileQr,
          operatingStartHour: profileStart,
          operatingEndHour: profileEnd,
          sportTypes: profileSports
        }
      });
      alert('Cập nhật thông tin cơ sở thành công!');
    } catch (e) {
      console.error(e);
      alert('Lỗi cập nhật thông tin cơ sở');
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;
    try {
      await addVenueImageMutation.mutateAsync({
        venueId: venueId!,
        data: {
          imageUrl: newImageUrl,
          imageType: newImageType
        }
      });
      setNewImageUrl('');
      alert('Thêm hình ảnh thành công!');
    } catch (e) {
      console.error(e);
      alert('Lỗi thêm hình ảnh');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này không?')) return;
    try {
      await deleteVenueImageMutation.mutateAsync({
        venueId: venueId!,
        imageId
      });
      alert('Xóa hình ảnh thành công!');
    } catch (e) {
      console.error(e);
      alert('Lỗi xóa hình ảnh');
    }
  };

  const handleSportToggle = (sport: string) => {
    if (profileSports.includes(sport)) {
      setProfileSports(profileSports.filter(s => s !== sport));
    } else {
      setProfileSports([...profileSports, sport]);
    }
  };

  return (
    <OwnerLayout 
      title={activeTab === 'pricing' ? 'Chỉnh sửa bảng giá sân' : `Cấu hình: ${venue.name}`} 
      showSystemHeader={activeTab !== 'pricing'}
      showBottomNav={activeTab !== 'pricing'}
    >
      {/* Back button removed as 1 Owner = 1 Venue */}
      {activeTab !== 'pricing' && (
        <div className="admin-tabs" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
          <button 
            className={`admin-tab-btn ${activeTab === 'courts' ? 'active' : ''}`}
            onClick={() => setActiveTab('courts')}
            style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'courts' ? '2px solid #f59e0b' : '2px solid transparent', color: activeTab === 'courts' ? '#f59e0b' : '#6b7280', fontWeight: activeTab === 'courts' ? 600 : 400, cursor: 'pointer' }}
          >
            Danh sách Sân con
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid #f59e0b' : '2px solid transparent', color: activeTab === 'profile' ? '#f59e0b' : '#6b7280', fontWeight: activeTab === 'profile' ? 600 : 400, cursor: 'pointer' }}
          >
            Thông tin cơ sở
          </button>
        </div>
      )}

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

          {courts?.length === 0 && (
            <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f3f4f6', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>Chưa có sân nào</h4>
                <p style={{ margin: 0, fontSize: 14, color: '#4b5563' }}>Bạn đã đăng ký quy mô {venue.venueScale} sân. Bạn có thể tự động tạo các sân mẫu này.</p>
              </div>
              <button 
                onClick={handleAutoInitCourts}
                style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
              >
                Khởi tạo {venue.venueScale} sân
              </button>
            </div>
          )}

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
        <div style={{
          margin: '-16px -16px',
          padding: '16px 16px 24px 16px',
          backgroundColor: '#2b6139',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 60px)',
          boxSizing: 'border-box'
        }}>
          {/* Custom PWA Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 4px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '16px'
          }}>
            <button 
              onClick={() => navigate(`/owner/venues/${venue.id}?tab=pricing`)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>Chỉnh sửa bảng giá sân</span>
            <button 
              onClick={() => {
                if (window.confirm('Bạn có muốn xóa toàn bộ bảng giá sân?')) {
                  setGroupedRows([]);
                }
              }}
              style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                border: '1px solid #ef4444', 
                borderRadius: '4px', 
                width: '28px', 
                height: '28px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer' 
              }}
            >
              <Trash2 size={15} color="#ef4444" />
            </button>
          </div>

          {/* Custom Tab buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: '20px' }}>
            <button 
              onClick={() => alert('Thêm loại sân mới sẽ khả dụng sớm.')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '6px',
                border: '1px dashed rgba(255, 255, 255, 0.4)',
                background: 'transparent',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Thêm loại sân +
            </button>
            <button 
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '6px',
                border: 'none',
                background: '#f5d061',
                color: '#0f172a',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              Bảng giá sân ✏️
            </button>
          </div>

          {/* Sân áp dụng */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Sân áp dụng</div>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>Khung giờ bắt buộc</div>
            <button 
              onClick={() => alert('Chức năng thêm khung giờ bắt buộc sẽ sớm được hỗ trợ.')}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: '6px',
                border: '1.5px dashed rgba(255, 255, 255, 0.4)',
                background: 'transparent',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Thêm khung giờ
            </button>
          </div>

          {/* Bảng giá */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Bảng giá</div>
            
            {/* Card white */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid #cbd5e1'
            }}>
              {/* Card Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid #cbd5e1'
              }}>
                <div style={{ display: 'flex', gap: 12, color: '#475569', fontWeight: 800 }}>
                  <span style={{ cursor: 'pointer' }}>↑</span>
                  <span style={{ cursor: 'pointer' }}>↓</span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                  {venue.sportTypes?.[0] || 'Cầu lông'}
                </div>
                <div style={{ display: 'flex', gap: 12, color: '#475569' }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => alert('Chỉnh sửa tên loại sân.')}><Edit2 size={16} color="#475569" /></span>
                  <span style={{ cursor: 'pointer' }} onClick={() => alert('Xóa bảng giá loại sân này.')}><Trash2 size={16} color="#ef4444" /></span>
                </div>
              </div>

              {/* Notice row */}
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderBottom: '1px solid #cbd5e1',
                fontWeight: 500
              }}>
                <span>👤 Đang hiển thị bảng giá với khách chơi</span>
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: 700, color: '#0f172a', textAlign: 'center', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>Khung giờ</th>
                    <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: 700, color: '#0f172a', textAlign: 'center', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>Cố định</th>
                    <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: 700, color: '#0f172a', textAlign: 'center', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>Vãng lai</th>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', width: '36px' }}></th>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid #cbd5e1', width: '36px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#1e293b', textAlign: 'center', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                        {row.isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                            <input 
                              type="time" 
                              value={row.startHour} 
                              onChange={e => updateGroupRow(idx, 'startHour', e.target.value)}
                              style={{ padding: '2px 4px', fontSize: '11px', width: '60px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                            <input 
                              type="time" 
                              value={row.endHour} 
                              onChange={e => updateGroupRow(idx, 'endHour', e.target.value)}
                              style={{ padding: '2px 4px', fontSize: '11px', width: '60px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>
                        ) : (
                          row.timeDisplay
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#1e293b', textAlign: 'center', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                        {row.isEditing ? (
                          <input 
                            type="number" 
                            value={row.fixedPrice} 
                            onChange={e => updateGroupRow(idx, 'fixedPrice', Number(e.target.value))}
                            style={{ padding: '2px 4px', fontSize: '11px', width: '65px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
                          />
                        ) : (
                          `${row.fixedPrice.toLocaleString('vi-VN')} đ`
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#1e293b', textAlign: 'center', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                        {row.isEditing ? (
                          <input 
                            type="number" 
                            value={row.casualPrice} 
                            onChange={e => updateGroupRow(idx, 'casualPrice', Number(e.target.value))}
                            style={{ padding: '2px 4px', fontSize: '11px', width: '65px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
                          />
                        ) : (
                          `${row.casualPrice.toLocaleString('vi-VN')} đ`
                        )}
                      </td>
                      <td style={{ padding: '12px 4px', textAlign: 'center', borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                        {row.isEditing ? (
                          <button 
                            onClick={() => saveGroupRow(idx)}
                            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: 0 }}
                            title="Lưu dòng này"
                          >
                            <Check size={18} color="#10b981" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => editGroupRow(idx)}
                            style={{ background: 'none', border: 'none', color: '#2b6139', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: 0 }}
                            title="Sửa dòng này"
                          >
                            <Edit2 size={16} color="#2b6139" />
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '12px 4px', textAlign: 'center', borderBottom: '1px solid #cbd5e1' }}>
                        <button 
                          onClick={() => deleteGroupRow(idx)}
                          style={{ background: 'none', border: 'none', color: '#2b6139', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: 0 }}
                          title="Xóa dòng này"
                        >
                          <Eye size={18} color="#2b6139" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Dotted button inside card */}
              <button 
                onClick={addNewGroupRow}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderTop: '1.5px dashed #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Thêm khung giờ
              </button>
            </div>

            {/* Dotted button under card */}
            <button 
              onClick={() => alert('Chức năng thêm đối tượng sẽ sớm khả dụng.')}
              style={{
                width: '100%',
                padding: '12px 0',
                marginTop: '16px',
                borderRadius: '8px',
                border: '1.5px dashed rgba(255, 255, 255, 0.4)',
                background: 'transparent',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Thêm đối tượng
            </button>
          </div>

          {/* Bottom Save Button - Flowing layout */}
          <div style={{
            padding: '24px 0 12px 0',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <button 
              onClick={handleSavePricingGrouped}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: '6px',
                border: 'none',
                background: '#f5d061',
                color: '#0f172a',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              LƯU
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="admin-section" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          {/* Section 1: Basic Information */}
          <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 className="admin-section-title" style={{ margin: '0 0 20px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={20} color="#f59e0b" /> Thông tin chung cơ sở
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tên cơ sở thể thao *</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={e => setProfileName(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
                  placeholder="VD: Sân Pickleball & Badminton Premium"
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Địa chỉ cơ sở *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    value={profileAddress} 
                    onChange={e => setProfileAddress(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
                    placeholder="Số nhà, Tên đường, Quận, Thành phố..."
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Số điện thoại liên hệ *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    value={profilePhone} 
                    onChange={e => setProfilePhone(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>QR Code thanh toán (Link ảnh nhận chuyển khoản)</label>
                <input 
                  type="text" 
                  value={profileQr} 
                  onChange={e => setProfileQr(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
                  placeholder="URL mã QR (Ví dụ VietQR, MoMo...)"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Giờ mở cửa *</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="time" 
                    value={profileStart} 
                    onChange={e => setProfileStart(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Giờ đóng cửa *</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="time" 
                    value={profileEnd} 
                    onChange={e => setProfileEnd(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Môn thể thao kinh doanh</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                  {['Cầu lông', 'Quần vợt', 'Pickleball', 'Bóng đá', 'Bóng rổ', 'Khác'].map(sport => {
                    const active = profileSports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => handleSportToggle(sport)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 20,
                          border: active ? '2px solid #f59e0b' : '1px solid #d1d5db',
                          background: active ? '#fef3c7' : 'white',
                          color: active ? '#d97706' : '#4b5563',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {sport}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mô tả ngắn</label>
                <textarea 
                  value={profileDesc} 
                  onChange={e => setProfileDesc(e.target.value)} 
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', resize: 'vertical' }}
                  placeholder="Giới thiệu về cơ sở của bạn (tiện ích đi kèm, dịch vụ nước uống, bãi đỗ xe...)"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button 
                onClick={handleSaveProfile} 
                disabled={updateVenueMutation.isPending}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: 8, 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                <Save size={18} /> Lưu thông tin cơ sở
              </button>
            </div>
          </div>

          {/* Section 2: Venue Images */}
          <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 className="admin-section-title" style={{ margin: '0 0 20px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image size={20} color="#f59e0b" /> Quản lý hình ảnh cơ sở
            </h2>

            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 10, border: '1px dashed #d1d5db', marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#374151' }}>Thêm hình ảnh mới</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={newImageUrl} 
                  onChange={e => setNewImageUrl(e.target.value)} 
                  placeholder="Nhập URL hình ảnh (Ví dụ: https://example.com/image.jpg)"
                  style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }}
                />
                <select 
                  value={newImageType} 
                  onChange={e => setNewImageType(e.target.value as any)}
                  style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white' }}
                >
                  <option value="Gallery">Ảnh thư viện (Gallery)</option>
                  <option value="Avatar">Ảnh Đại diện (Avatar)</option>
                </select>
                <button 
                  onClick={handleAddImage}
                  disabled={addVenueImageMutation.isPending}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4, 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: 8, 
                    fontWeight: 600, 
                    cursor: 'pointer' 
                  }}
                >
                  <Plus size={16} /> Thêm
                </button>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#6b7280' }}>
                Gợi ý: Bạn có thể upload ảnh lên Imgur, Cloudinary rồi dán link URL vào đây.
              </p>
            </div>

            {/* Images Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
              {/* Avatar (nếu có) */}
              {venue.images?.filter((img: any) => img.imageType === 'Avatar').map((img: any) => (
                <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '3px solid #f59e0b', height: 180 }}>
                  <img src={img.imageUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                    AVATAR
                  </div>
                  <button 
                    onClick={() => handleDeleteImage(img.id)}
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* Gallery Images */}
              {venue.images?.filter((img: any) => img.imageType === 'Gallery' || img.imageType === 'Cover').map((img: any) => (
                <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', height: 180 }}>
                  <img src={img.imageUrl} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                    THƯ VIỆN
                  </div>
                  <button 
                    onClick={() => handleDeleteImage(img.id)}
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {(!venue.images || venue.images.length === 0) && (
                <div style={{ gridColumn: 'span 10', textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                  <Camera size={36} style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>Cơ sở chưa có hình ảnh nào. Hãy thêm ảnh Đại diện và ảnh Thư viện của sân.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
