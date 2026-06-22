import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyBookings } from '../../hooks/queries/useBookingQueries';
import { useGetPaymentUrl } from '../../hooks/mutations/useBookingMutations';
import { useCreateMatch } from '../../hooks/mutations/useMatchMutations';
import { useCreateReview } from '../../hooks/mutations/useReviewMutations';
import { CircleDollarSign, Star, Calendar } from 'lucide-react';
import SubPageHeader from '../../components/common/SubPageHeader';
import BookingCard from '../../components/booking/BookingCard';
import './profile.css';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { data: bookingsData, isLoading: queryLoading } = useMyBookings();
  const bookings = token ? (Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.data || []) : [];
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
    <div className="profile-page-container">
      <SubPageHeader title="Danh sách đặt lịch" />

      <div className="profile-page-content">
        
        {/* Filter Dropdown Area */}
        <div className="profile-filter-wrapper">
          <div className="profile-dropdown-container">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="profile-dropdown-btn"
            >
              <span style={{ fontWeight: '500' }}>Xem tất cả</span>
              <Calendar size={18} color="#0f172a" />
            </button>
            
            {showFilterDropdown && (
              <div className="profile-dropdown-menu">
                {['Chọn khoảng ngày', 'Chọn tháng', 'Chọn năm', 'Xem tất cả'].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setShowFilterDropdown(false)}
                    className="profile-dropdown-item"
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
          <p className="profile-loading-text">Đang tải lịch sử đặt sân...</p>
        ) : bookings.length === 0 ? (
          <div className="profile-empty-container">
            <p className="profile-empty-text">Bạn chưa có lịch đặt</p>
          </div>
        ) : (
          <div className="profile-list-gap">
            {bookings.map((booking: any) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPayNow={handlePayNow}
                onCreateMatch={handleOpenCreateMatchModal}
                onReview={handleOpenReviewModal}
                isPaying={getPaymentUrlMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Modal Tạo Kèo Đấu */}
        {selectedBooking && (
          <div className="profile-modal-overlay">
            <div className="profile-modal-box">
              <h2 className="profile-modal-title">
                Tạo Kèo Đấu Giao Lưu
              </h2>
              <p className="profile-modal-subtitle">
                Nhập thông tin trận đấu để những người chơi khác trên hệ thống có thể đăng ký tham gia cùng bạn.
              </p>

              <form onSubmit={handleCreateMatchSubmit} className="profile-modal-form">
                
                {/* Title */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Tiêu đề kèo đấu
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="profile-form-input"
                  />
                </div>

                {/* Grid inputs */}
                <div className="profile-form-grid">
                  
                  {/* Skill level */}
                  <div className="profile-form-group">
                    <label className="profile-form-label">
                      Yêu cầu trình độ
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="profile-form-select"
                    >
                      <option value="Newbie">Mới chơi (Newbie)</option>
                      <option value="Intermediate">Trung bình (Intermediate)</option>
                      <option value="Advanced">Khá / Tốt (Advanced)</option>
                    </select>
                  </div>

                  {/* Max Players */}
                  <div className="profile-form-group">
                    <label className="profile-form-label">
                      Số người chơi tối đa
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      required
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                      className="profile-form-input"
                    />
                  </div>

                </div>

                {/* Fee */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Phí chia sẻ / người chơi (VND)
                  </label>
                  <div className="profile-input-icon-wrapper">
                    <CircleDollarSign size={18} className="profile-input-icon" />
                    <input
                      type="number"
                      min={0}
                      required
                      value={feePerPlayer}
                      onChange={(e) => setFeePerPlayer(parseInt(e.target.value))}
                      className="profile-form-input has-icon"
                    />
                  </div>
                  <span className="profile-form-tip">
                    Nhập 0 nếu bạn muốn bao trọn tiền sân và chơi giao lưu miễn phí.
                  </span>
                </div>

                {/* Buttons */}
                <div className="profile-modal-buttons">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="profile-btn-cancel"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={createMatchMutation.isPending}
                    className="profile-btn-submit"
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
          <div className="profile-modal-overlay">
            <div className="profile-modal-box small">
              <h2 className="profile-modal-title">
                Đánh giá sân
              </h2>
              <p className="profile-modal-subtitle">
                Chia sẻ trải nghiệm của bạn tại {reviewBooking.venueName} nhé!
              </p>

              <form onSubmit={handleCreateReviewSubmit} className="profile-modal-form">
                <div className="profile-stars-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={32} 
                      fill={star <= reviewRating ? "#f59e0b" : "transparent"} 
                      color={star <= reviewRating ? "#f59e0b" : "#cbd5e1"}
                      onClick={() => setReviewRating(star)}
                      className="profile-star-clickable"
                    />
                  ))}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Nhận xét (không bắt buộc)
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Sân sạch đẹp, anh chủ nhiệt tình..."
                    className="profile-form-textarea"
                  />
                </div>

                <div className="profile-modal-buttons">
                  <button
                    type="button"
                    onClick={() => setReviewBooking(null)}
                    className="profile-btn-cancel"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createReviewMutation.isPending}
                    className="profile-btn-submit green"
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
