import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Check, X, Trash2, Image, Camera, Save, Globe, Phone, MapPin, Clock } from 'lucide-react';
import OwnerLayout from './OwnerLayout';
import { useVenueDetail, useCourts, usePriceRules } from '../../hooks/queries/useOwnerQueries';
import { useAddCourt, useUpdateCourt, useUpsertPriceRules, useUpdateVenue, useAddVenueImage, useDeleteVenueImage } from '../../hooks/mutations/useOwnerMutations';

export default function VenueConfigPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
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

  // Pricing State
  const [draftPrices, setDraftPrices] = useState<any[]>([]);

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

  // Init prices when loaded
  useEffect(() => {
    if (priceRules && !loadingPrices) {
      setDraftPrices(priceRules);
    }
  }, [priceRules, loadingPrices]);

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

  const handleSavePricing = async () => {
    try {
      await upsertPricesMutation.mutateAsync({ venueId: venueId!, data: draftPrices });
      alert('Đã lưu cấu hình giá!');
    } catch (error) {
      console.error(error);
      alert('Lỗi lưu cấu hình giá');
    }
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
      title={`Cấu hình: ${venue.name}`} 
      subtitle={`Quản lý Sân con, Bảng giá và Hồ sơ cho ${venue.name}`}
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
        <button 
          className={`admin-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid #f59e0b' : '2px solid transparent', color: activeTab === 'profile' ? '#f59e0b' : '#6b7280', fontWeight: activeTab === 'profile' ? 600 : 400, cursor: 'pointer' }}
        >
          Thông tin cơ sở
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
                  {['Cầu lông', 'Tennis', 'Pickleball', 'Bóng đá', 'Bóng rổ', 'Khác'].map(sport => {
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
