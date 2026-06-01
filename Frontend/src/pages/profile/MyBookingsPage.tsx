import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useMyBookings } from '../../hooks/queries/useBookingQueries';
import { useGetPaymentUrl } from '../../hooks/mutations/useBookingMutations';
import { useCreateMatch } from '../../hooks/mutations/useMatchMutations';
import { useCreateReview } from '../../hooks/mutations/useReviewMutations';
import { CircleDollarSign, Trophy, CreditCard, Star, Calendar } from 'lucide-react';
import SubPageHeader from '../../components/common/SubPageHeader';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { data: bookingsData, isLoading: queryLoading } = useMyBookings();
  const bookings = token ? (bookingsData?.data || []) : [];
  const isLoading = token ? queryLoading : false;

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const getPaymentUrlMutation = useGetPaymentUrl();
  const createMatchMutation = useCreateMatch();

  // State quản lý Modal tạo kèo đấu
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [feePerPlayer, setFeePerPlayer] = useState(0);

  // State quản lý Modal Đánh giá
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const createReviewMutation = useCreateReview();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#fff7ed', color: '#c2410c', fontSize: 12, fontWeight: '700' }}>CHỜ THANH TOÁN</span>;
      case 'CONFIRMED':
        return <span style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#e6f4ea', color: '#137333', fontSize: 12, fontWeight: '700' }}>ĐÃ XÁC NHẬN</span>;
      case 'CANCELLED':
        return <span style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: '700' }}>ĐÃ HỦY</span>;
      default:
        return <span style={{ padding: '6px 12px', borderRadius: 8, backgroundColor: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: '700' }}>{status}</span>;
    }
  };

  const handlePayNow = async (bookingId: string) => {
    try {
      const paymentUrl = await getPaymentUrlMutation.mutateAsync(bookingId);
      window.location.href = paymentUrl;
    } catch (error: any) {
      alert('Lỗi lấy link thanh toán: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenCreateMatchModal = (booking: any) => {
    setSelectedBooking(booking);
    setTitle(`Giao lưu Pickleball tại ${booking.venueName}`);
    setSkillLevel('Intermediate');
    setMaxPlayers(4);
    setFeePerPlayer(0);
  };

  const handleCreateMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      await createMatchMutation.mutateAsync({
        bookingId: selectedBooking.id,
        title,
        skillLevel,
        maxPlayers,
        feePerPlayer
      });
      alert('Tạo kèo đấu thành công! Kèo đấu đã hiển thị ở Sảnh Tìm Đối.');
      setSelectedBooking(null);
      navigate('/matches');
    } catch (error: any) {
      alert('Lỗi tạo kèo đấu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenReviewModal = (booking: any) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    try {
      await createReviewMutation.mutateAsync({
        bookingId: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment
      });
      alert('Gửi đánh giá thành công! Cảm ơn nhận xét của bạn.');
      setReviewBooking(null);
    } catch (error: any) {
      alert('Lỗi gửi đánh giá: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <SubPageHeader title="Danh sách đặt lịch" />

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Filter Dropdown Area */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '200px' }}>
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '10px 16px', border: '1px solid #94a3b8', 
                borderRadius: '6px', backgroundColor: '#ffffff',
                color: '#1e293b', fontSize: '14px', cursor: 'pointer',
                width: '100%', justifyContent: 'space-between',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ fontWeight: '500' }}>Xem tất cả</span>
              <Calendar size={18} color="#0f172a" />
            </button>
            
            {showFilterDropdown && (
              <div style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #d97706',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 20,
                boxSizing: 'border-box', overflow: 'hidden'
              }}>
                {['Chọn khoảng ngày', 'Chọn tháng', 'Chọn năm', 'Xem tất cả'].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setShowFilterDropdown(false)}
                    style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#064e3b',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderBottom: idx < 3 ? '1px solid #d97706' : 'none'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fde68a')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Đang tải lịch sử đặt sân...</p>
        ) : bookings.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#064e3b', fontSize: '15px', fontWeight: '500' }}>Bạn chưa có lịch đặt</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((booking: any) => (
              <div 
                key={booking.id} 
                style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '16px', 
                  padding: '24px', 
                  backgroundColor: '#ffffff', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700' }}>
                    <Link to={`/venue/${booking.venueId}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                      {booking.venueName}
                    </Link>
                  </h3>
                  <div style={{ color: '#475569', fontSize: 14, marginBottom: 6 }}>
                    <strong>Sân:</strong> {booking.courtName}
                  </div>
                  <div style={{ color: '#475569', fontSize: 14, marginBottom: 12 }}>
                    <strong>Thời gian:</strong> {formatDate(booking.startTime)} - {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusBadge(booking.status)}
                    
                    {/* Nút hành động bổ sung */}
                    {booking.status === 'PENDING' && (
                      <button
                        onClick={() => handlePayNow(booking.id)}
                        disabled={getPaymentUrlMutation.isPending}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '8px',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <CreditCard size={14} />
                        {getPaymentUrlMutation.isPending ? 'Đang tải...' : 'Thanh toán ngay'}
                      </button>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleOpenCreateMatchModal(booking)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '8px',
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <Trophy size={14} />
                        Tạo kèo (Tìm đối)
                      </button>
                    )}
                    
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleOpenReviewModal(booking)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '8px',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <Star size={14} />
                        Đánh giá
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: '4px' }}>Tổng thanh toán</div>
                  <div style={{ fontSize: 20, fontWeight: '800', color: '#ef4444' }}>{formatPrice(booking.totalPrice)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Tạo Kèo Đấu */}
        {selectedBooking && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999
            }}
          >
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                margin: '0 20px'
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Tạo Kèo Đấu Giao Lưu
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                Nhập thông tin trận đấu để những người chơi khác trên hệ thống có thể đăng ký tham gia cùng bạn.
              </p>

              <form onSubmit={handleCreateMatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Tiêu đề kèo đấu
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                {/* Grid inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Skill level */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                      Yêu cầu trình độ
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                    >
                      <option value="Newbie">Mới chơi (Newbie)</option>
                      <option value="Intermediate">Trung bình (Intermediate)</option>
                      <option value="Advanced">Khá / Tốt (Advanced)</option>
                    </select>
                  </div>

                  {/* Max Players */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                      Số người chơi tối đa
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      required
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>

                </div>

                {/* Fee */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Phí chia sẻ / người chơi (VND)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CircleDollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="number"
                      min={0}
                      required
                      value={feePerPlayer}
                      onChange={(e) => setFeePerPlayer(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    Nhập 0 nếu bạn muốn bao trọn tiền sân và chơi giao lưu miễn phí.
                  </span>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'transparent',
                      color: '#475569',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={createMatchMutation.isPending}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {createMatchMutation.isPending ? 'Đang tạo...' : 'Tạo kèo'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Modal Đánh giá */}
        {reviewBooking && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999
            }}
          >
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                margin: '0 20px'
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Đánh giá sân
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                Chia sẻ trải nghiệm của bạn tại {reviewBooking.venueName} nhé!
              </p>

              <form onSubmit={handleCreateReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={32} 
                      fill={star <= reviewRating ? "#f59e0b" : "transparent"} 
                      color={star <= reviewRating ? "#f59e0b" : "#cbd5e1"}
                      onClick={() => setReviewRating(star)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                    Nhận xét (không bắt buộc)
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Sân sạch đẹp, anh chủ nhiệt tình..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setReviewBooking(null)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'transparent',
                      color: '#475569',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createReviewMutation.isPending}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {createReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
