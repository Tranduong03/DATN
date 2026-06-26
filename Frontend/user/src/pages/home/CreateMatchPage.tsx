import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateMatch } from '../../hooks/mutations/useMatchMutations';
import { useMyBookings } from '../../hooks/queries/useBookingQueries';
import { useSportCategories } from '../../hooks/queries/usePublicQueries';
import { ChevronLeft, Calendar, MapPin, Users, CircleDollarSign, Trophy } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Query hooks
  const { data: bookingsData, isLoading: bookingsLoading } = useMyBookings();
  const { data: sportsData = [] } = useSportCategories();
  const createMatchMutation = useCreateMatch();

  const bookings = token ? (Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.data || []) : [];

  // Form State
  const [title, setTitle] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [feePerPlayer, setFeePerPlayer] = useState(0);
  
  // Checkbox state: true = Sân tự chọn ngoài hệ thống (tự điền), false = Chọn sân trên hệ thống (dropdown)
  const [isManual, setIsManual] = useState(false);
  
  // System Booking State
  const [selectedBookingId, setSelectedBookingId] = useState('');
  
  // Field States (Shared between modes)
  const [customVenueName, setCustomVenueName] = useState('');
  const [customCourtName, setCustomCourtName] = useState('');
  const [sportType, setSportType] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');

  // Auto set mode if user has no bookings
  useEffect(() => {
    if (!bookingsLoading && bookings.length === 0) {
      setIsManual(true);
    }
  }, [bookings, bookingsLoading]);

  // Set default sport type from categories when loaded
  useEffect(() => {
    if (sportsData.length > 0 && !sportType) {
      setSportType(sportsData[0].name);
    }
  }, [sportsData, sportType]);

  // Format ISO dates to datetime-local format: YYYY-MM-DDTHH:MM
  const formatForInput = (dateStr: string) => {
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleBookingChange = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    if (bookingId) {
      const booking = bookings.find((b: any) => b.id === bookingId);
      if (booking) {
        setCustomVenueName(booking.venueName || '');
        setCustomCourtName(booking.courtName || '');
        setSportType(booking.sportType || 'Cầu lông');
        setCustomStartTime(formatForInput(booking.startTime));
        setCustomEndTime(formatForInput(booking.endTime));
      }
    } else {
      setCustomVenueName('');
      setCustomCourtName('');
      setCustomStartTime('');
      setCustomEndTime('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Vui lòng đăng nhập để tạo kèo đấu!');
      navigate('/login');
      return;
    }

    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề kèo đấu!');
      return;
    }

    if (maxPlayers < 2) {
      alert('Số lượng người chơi tối đa phải từ 2 người trở lên!');
      return;
    }

    // Prepare payload
    const payload: any = {
      title: title.trim(),
      skillLevel,
      maxPlayers: Number(maxPlayers),
      feePerPlayer: Number(feePerPlayer),
    };

    if (!isManual) {
      if (!selectedBookingId) {
        alert('Vui lòng chọn một lịch đặt sân từ danh sách!');
        return;
      }
      payload.bookingId = selectedBookingId;
      payload.customVenueName = null;
      payload.customCourtName = null;
      payload.sportType = null;
      payload.customStartTime = null;
      payload.customEndTime = null;
    } else {
      if (!customVenueName.trim()) {
        alert('Vui lòng nhập tên sân!');
        return;
      }
      if (!customStartTime || !customEndTime) {
        alert('Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc!');
        return;
      }
      if (new Date(customStartTime) >= new Date(customEndTime)) {
        alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
        return;
      }
      payload.bookingId = null;
      payload.customVenueName = customVenueName.trim();
      payload.customCourtName = customCourtName.trim() || 'Sân tự do';
      payload.sportType = sportType;
      payload.customStartTime = new Date(customStartTime).toISOString();
      payload.customEndTime = new Date(customEndTime).toISOString();
    }

    try {
      const result = await createMatchMutation.mutateAsync(payload);
      alert('Tạo kèo đấu thành công!');
      navigate(`/matches/${result.id}`);
    } catch (error: any) {
      alert('Lỗi tạo kèo đấu: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px 20px', maxWidth: '640px', margin: '0 auto', minHeight: '85vh' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            marginBottom: 20, 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            fontSize: '15px',
            color: '#64748b',
            fontWeight: '600'
          }}
        >
          <ChevronLeft size={20} /> Quay lại
        </button>

        {/* Page Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
            Tạo Kèo Đấu Mới
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            Tạo kèo giao lưu để tìm bạn chơi chung hoặc hoàn thành đội hình trận đấu của bạn.
          </p>
        </div>

        {/* Main Card Form */}
        <form 
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            padding: '28px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Section: Thông tin chung */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} style={{ color: '#10b981' }} /> Thông tin chung
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tiêu đề */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Tiêu đề kèo đấu <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Giao lưu cầu lông tối thứ 7 Quận 7"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Trình độ và Số người */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Yêu cầu trình độ
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '15px',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Beginner">Mới chơi / Cơ bản (Beginner)</option>
                    <option value="Intermediate">Trung bình (Intermediate)</option>
                    <option value="Advanced">Nâng cao / Giỏi (Advanced)</option>
                    <option value="Open">Mọi trình độ (Open)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Số người tối đa <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={2}
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Chi phí */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Chi phí dự kiến / người (VNĐ)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Để 0 nếu miễn phí chia sẻ"
                    value={feePerPlayer}
                    onChange={(e) => setFeePerPlayer(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '14px' }}>
                    đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0' }} />

          {/* Section: Địa điểm & Thời gian */}
          <div>
            {/* Header section with manual tick checkbox */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} style={{ color: '#10b981' }} /> Thông tin địa điểm & thời gian
              </h3>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#059669', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={isManual}
                  disabled={bookings.length === 0}
                  onChange={(e) => {
                    setIsManual(e.target.checked);
                    if (e.target.checked) {
                      setSelectedBookingId('');
                      setCustomVenueName('');
                      setCustomCourtName('');
                      setCustomStartTime('');
                      setCustomEndTime('');
                    } else {
                      setCustomVenueName('');
                      setCustomCourtName('');
                      setCustomStartTime('');
                      setCustomEndTime('');
                    }
                  }}
                  style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                />
                Tự điền (Sân thuê ngoài)
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tên sân */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Tên sân <span style={{ color: '#ef4444' }}>*</span>
                </label>
                
                {isManual ? (
                  <input
                    type="text"
                    placeholder="Nhập tên sân (Ví dụ: Sân cỏ nhân tạo Kỳ Hòa)"
                    value={customVenueName}
                    onChange={(e) => setCustomVenueName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                ) : (
                  <div>
                    {bookingsLoading ? (
                      <div style={{ fontSize: '14px', color: '#64748b', padding: '12px' }}>Đang tải danh sách đặt sân...</div>
                    ) : bookings.length === 0 ? (
                      <div style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#64748b', fontSize: '14px' }}>
                        Bạn chưa có lịch đặt sân nào. Vui lòng tick chọn "Tự điền" để nhập sân thuê ngoài.
                      </div>
                    ) : (
                      <select
                        value={selectedBookingId}
                        onChange={(e) => handleBookingChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '12px',
                          fontSize: '15px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        required={!isManual}
                      >
                        <option value="">-- Chọn lịch đặt sân của bạn --</option>
                        {bookings
                          .filter((b: any) => b.status === 'CONFIRMED' || b.status === 'PENDING')
                          .map((b: any) => {
                            const date = new Date(b.startTime).toLocaleDateString('vi-VN');
                            const start = new Date(b.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                            const end = new Date(b.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                            return (
                              <option key={b.id} value={b.id}>
                                {b.venueName} ({b.courtName}) - {date} [{start} - {end}]
                              </option>
                            );
                          })}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Sân số & Môn thể thao */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Sân số (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Sân số 2"
                    value={customCourtName}
                    disabled={!isManual}
                    onChange={(e) => setCustomCourtName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: isManual ? '#ffffff' : '#f8fafc',
                      color: isManual ? '#0f172a' : '#64748b',
                      cursor: isManual ? 'text' : 'not-allowed'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Môn thể thao
                  </label>
                  {isManual ? (
                    sportsData.length > 0 ? (
                      <select
                        value={sportType}
                        onChange={(e) => setSportType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '12px',
                          fontSize: '15px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        {sportsData.map((sport: any) => (
                          <option key={sport.id} value={sport.name}>
                            {sport.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Ví dụ: Cầu lông"
                        value={sportType}
                        onChange={(e) => setSportType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    )
                  ) : (
                    <input
                      type="text"
                      placeholder="Chọn đặt sân để tự điền..."
                      value={sportType}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        fontSize: '15px',
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        cursor: 'not-allowed',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Thời gian bắt đầu & kết thúc */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Thời gian bắt đầu <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={customStartTime}
                    disabled={!isManual}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: isManual ? '#ffffff' : '#f8fafc',
                      color: isManual ? '#0f172a' : '#64748b',
                      cursor: isManual ? 'pointer' : 'not-allowed'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Thời gian kết thúc <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={customEndTime}
                    disabled={!isManual}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: isManual ? '#ffffff' : '#f8fafc',
                      color: isManual ? '#0f172a' : '#64748b',
                      cursor: isManual ? 'pointer' : 'not-allowed'
                    }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createMatchMutation.isPending}
            style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: createMatchMutation.isPending ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {createMatchMutation.isPending ? 'Đang tạo kèo...' : 'Đăng kèo ngay'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
