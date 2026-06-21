import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, X, ChevronDown } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenueDetail } from '../../hooks/queries/usePublicQueries';
import { useCreateBooking, useGetPaymentUrl } from '../../hooks/mutations/useBookingMutations';
import axiosClient from '../../api/axiosClient';

export default function BookingConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    venueId: string;
    selectedDate: string;
    groupedBookings: { courtId: string; courtName: string; startTime: string; endTime: string; price: number }[];
    totalPriceSum: number;
    totalHoursStr: string;
  } | null;

  if (!state) {
    useEffect(() => {
      navigate(-1);
    }, []);
    return null;
  }

  const { venueId, selectedDate, groupedBookings, totalPriceSum, totalHoursStr } = state;

  // Fetch venue detail
  const { data: venue } = usePublicVenueDetail(venueId);

  const formatAddress = (addr?: string) => {
    if (!addr) return 'Đang tải...';
    const parts = addr.split(',');
    if (parts.length > 1) {
      return parts.slice(0, -1).join(',').trim();
    }
    return addr;
  };

  // Profile data
  const [bookerName, setBookerName] = useState('');
  const [bookerPhone, setBookerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const createBookingMutation = useCreateBooking();
  const getPaymentUrlMutation = useGetPaymentUrl();

  useEffect(() => {
    axiosClient.get('/users/profile')
      .then((res: any) => {
        if (res?.data) {
          setBookerName(res.data.fullName || '');
          setBookerPhone(res.data.phone || '');
        }
      })
      .catch((err) => console.error('Lỗi khi lấy thông tin user:', err));
  }, []);

  const formatDisplayDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formatTimeHeader = (timeStr: string) => {
    const dateObj = new Date(timeStr);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}h${minutes}`;
  };

  // Extract sport type / group name
  const sportType = venue?.sportTypes?.[0] || 'Pickleball';

  const handleConfirmAndPay = async () => {
    if (!bookerName.trim()) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }
    if (!bookerPhone.trim()) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update user profile with Booker Name & Phone
      await axiosClient.put('/users/profile', {
        fullName: bookerName,
        phone: bookerPhone
      });

      // 2. Create the bookings sequentially or in parallel
      const bookings = await Promise.all(
        groupedBookings.map((selection) =>
          createBookingMutation.mutateAsync({
            courtId: selection.courtId,
            startTime: selection.startTime,
            endTime: selection.endTime,
          })
        )
      );

      if (bookings.length > 0) {
        const bookingId = bookings[0].id;
        const paymentUrl = await getPaymentUrlMutation.mutateAsync(bookingId);
        window.location.href = paymentUrl;
      } else {
        alert('Đặt lịch thành công!');
        navigate('/reservedBooking');
      }
    } catch (error: any) {
      alert('Lỗi đặt lịch: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout noPaddingBottom={true}>
      <div className="booking-confirm-container">
        {/* Header bar */}
        <div className="booking-confirm-header">
          <button onClick={() => navigate(-1)} className="booking-confirm-back-btn">
            <ChevronLeft size={24} color="#ffffff" />
          </button>
          <h1 className="booking-confirm-header-title">Đặt lịch ngày trực quan</h1>
          <div style={{ width: 24 }} />
        </div>

        <div className="booking-confirm-content">
          {/* Card 1: Thông tin sân */}
          <div className="booking-confirm-card">
            <h2 className="booking-confirm-card-title">
              <span className="card-title-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" transform="matrix(-1, 0, 0, 1, 0, 0)" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                  <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </span> Thông tin sân
            </h2>
            <div className="booking-confirm-card-body">
              <div className="confirm-info-row">
                <span className="confirm-info-label">Tên CLB:</span>
                <span className="confirm-info-val bold">{venue?.name || 'Đang tải...'}</span>
              </div>
              <div className="confirm-info-row">
                <span className="confirm-info-label">Địa chỉ:</span>
                <span className="confirm-info-val">{formatAddress(venue?.address)}</span>
              </div>
              <div className="confirm-info-row">
                <span className="confirm-info-label">SĐT:</span>
                <span className="confirm-info-val">{venue?.contactPhone || 'Đang tải...'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Thông tin lịch đặt */}
          <div className="booking-confirm-card">
            <h2 className="booking-confirm-card-title">
              <span className="card-title-icon">
                <svg viewBox="0 0 1024 1024" width="22" height="22" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000" transform="rotate(90)" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M840.9 100.9L744 866.4c-1.9 15.4-16 26.2-31.3 24.3l-370.2-46.9c-15.4-1.9-26.2-16-24.3-31.3l96.9-765.6c1.9-15.4 16-26.2 31.3-24.3l370.2 46.9c15.4 2 26.2 16 24.3 31.4z" fill="#B6CDEF"></path>
                    <path d="M716.2 905.9c-1.8 0-3.7-0.1-5.5-0.3l-370.2-46.9c-11.4-1.4-21.6-7.2-28.6-16.3-7-9.1-10.1-20.4-8.7-31.8L400.1 45c3-23.5 24.6-40.3 48.1-37.3l370.2 46.9c23.5 3 40.3 24.6 37.3 48.1l-96.9 765.6c-1.4 11.4-7.2 21.6-16.3 28.6-7.6 5.9-16.8 9-26.3 9zM442.9 37.4c-6.5 0-12.1 4.8-12.9 11.4l-97 765.6c-0.4 3.5 0.5 6.9 2.6 9.6 2.1 2.8 5.2 4.5 8.7 4.9l370.2 46.9c3.4 0.4 6.9-0.5 9.6-2.6 2.8-2.1 4.5-5.2 4.9-8.7L826 99c0.9-7.1-4.2-13.7-11.3-14.6L444.6 37.5c-0.6 0-1.1-0.1-1.7-0.1z" fill="#0F53A8"></path>
                    <path d="M599.8 144.7l88.7 766.6c1.8 15.4-9.2 29.3-24.6 31.1l-370.7 42.9c-15.4 1.8-29.3-9.2-31.1-24.6l-88.7-766.6c-1.8-15.4 9.2-29.3 24.6-31.1l370.7-42.9c15.4-1.8 29.3 9.3 31.1 24.6z" fill="#B6CDEF"></path>
                    <path d="M290 1000.5c-21.5 0-40.2-16.2-42.7-38.1l-88.7-766.6c-2.7-23.6 14.2-45 37.8-47.7L567 105.2c23.6-2.7 45 14.2 47.7 37.8l88.7 766.6c2.7 23.6-14.2 45-37.8 47.7l-370.7 42.9c-1.6 0.2-3.3 0.3-4.9 0.3z m281.9-865.6c-0.5 0-1 0-1.5 0.1l-370.7 42.9c-3.5 0.4-6.6 2.1-8.7 4.9s-3.1 6.1-2.7 9.6L277 958.9c0.8 7.1 7.3 12.3 14.4 11.4l370.7-42.9c7.1-0.8 12.3-7.3 11.4-14.4l-88.7-766.6c-0.7-6.6-6.4-11.5-12.9-11.5z" fill="#0F53A8"></path>
                    <path d="M482 788.9l10.9 94.1c1.8 15.4-9.2 29.3-24.6 31.1L374.2 925c-15.4 1.8-29.3-9.2-31.1-24.6l-10.9-94.1c-1.8-15.4 9.2-29.3 24.6-31.1l94.1-10.9c15.4-1.8 29.4 9.2 31.1 24.6z" fill="#89B7F5"></path>
                    <path d="M370.9 940.2c-21.5 0-40.2-16.2-42.7-38.1L317.3 808c-2.7-23.6 14.2-45 37.8-47.7l94.1-10.9c23.6-2.7 45 14.2 47.7 37.8l10.9 94.1c2.7 23.6-14.2 45-37.8 47.7l-94.1 10.9c-1.7 0.2-3.3 0.3-5 0.3z m83.3-161.1c-0.5 0-1 0-1.5 0.1l-94.1 10.9c-7.1 0.8-12.3 7.3-11.4 14.4l10.9 94.1c0.8 7.1 7.3 12.3 14.4 11.4l94.1-10.9c7.1-0.8 12.3-7.3 11.4-14.4l-10.9-94.1c-0.7-6.6-6.4-11.5-12.9-11.5z" fill="#0F53A8"></path>
                    <path d="M328.7 715.3c-7.5 0-14-5.6-14.9-13.3l-28.2-243.6c-1-8.2 4.9-15.7 13.2-16.6 8.2-1 15.7 4.9 16.6 13.2l28.2 243.6c1 8.2-4.9 15.7-13.2 16.6-0.5 0.1-1.1 0.1-1.7 0.1zM393 717.1c-7.5 0-14-5.6-14.9-13.3L340.7 381c-1-8.2 4.9-15.7 13.2-16.6 8.2-1 15.7 4.9 16.6 13.2l37.4 322.8c1 8.2-4.9 15.7-13.2 16.6-0.6 0.1-1.1 0.1-1.7 0.1zM462.3 709.1c-7.5 0-14-5.6-14.9-13.3l-23.3-201c-1-8.2 4.9-15.7 13.2-16.6 8.2-1 15.7 4.9 16.6 13.2l23.3 201c1 8.2-4.9 15.7-13.2 16.6-0.6 0.1-1.2 0.1-1.7 0.1z" fill="#0F53A8"></path>
                    <path d="M234.9 250.1c-7.5 0-14-5.6-14.9-13.3-1-8.2 4.9-15.7 13.2-16.6l45.2-5.2c8.2-1 15.7 4.9 16.6 13.2s-4.9 15.7-13.2 16.6l-45.2 5.2c-0.5 0.1-1.1 0.1-1.7 0.1zM324.6 239.8c-7.5 0-14-5.6-14.9-13.3-1-8.2 4.9-15.7 13.2-16.6l45.2-5.2c8.2-1 15.7 4.9 16.6 13.2 1 8.2-4.9 15.7-13.2 16.6l-45.2 5.2c-0.5 0-1.1 0.1-1.7 0.1zM414.3 229.4c-7.5 0-14-5.6-14.9-13.3-1-8.2 4.9-15.7 13.2-16.6l45.2-5.2c8.2-1 15.7 4.9 16.6 13.2 1 8.2-4.9 15.7-13.2 16.6l-45.2 5.2c-0.5 0-1.1 0.1-1.7 0.1zM504 219c-7.5 0-14-5.6-14.9-13.3-1-8.2 4.9-15.7 13.2-16.6l45.2-5.2c8.2-0.9 15.7 4.9 16.6 13.2 1 8.2-4.9 15.7-13.2 16.6l-45.2 5.2c-0.6 0.1-1.1 0.1-1.7 0.1z" fill="#0F53A8"></path>
                  </g>
                </svg>
              </span> Thông tin lịch đặt
            </h2>
            <div className="booking-confirm-card-body">
              <div className="confirm-info-row">
                <span className="confirm-info-label">Ngày:</span>
                <span className="confirm-info-val bold">{formatDisplayDate(selectedDate)}</span>
              </div>

              <div className="confirm-slots-list">
                {groupedBookings.map((b, idx) => (
                  <div key={idx} className="confirm-slot-item">
                    - {b.courtName}: {formatTimeHeader(b.startTime)} - {formatTimeHeader(b.endTime)} | <span className="underline">{b.price.toLocaleString()} đ</span>
                  </div>
                ))}
              </div>

              <div className="confirm-info-row">
                <span className="confirm-info-label">Đối tượng:</span>
                <span className="confirm-info-val bold">{sportType}</span>
              </div>
              <div className="confirm-info-row">
                <span className="confirm-info-label">Tổng giờ:</span>
                <span className="confirm-info-val">{totalHoursStr}</span>
              </div>
              <div className="confirm-info-row">
                <span className="confirm-info-label">Tổng tiền:</span>
                <span className="confirm-info-val bold price-highlight">{totalPriceSum.toLocaleString()} đ</span>
              </div>
            </div>
          </div>

          {/* Block: Ưu đãi */}
          <div className="booking-confirm-card">
            <div className="confirm-promo-row">
              <span className="promo-label">Ưu đãi</span>
              <button className="promo-selector-btn">
                <span>Chọn ưu đãi áp dụng</span>
                <svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="22" height="22" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <title>plus-circle</title>
                    <desc>Created with Sketch Beta.</desc>
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                      <g id="Icon-Set-Filled" transform="translate(-466.000000, -1089.000000)" fill="#f8eb92">
                        <path d="M488,1106 L483,1106 L483,1111 C483,1111.55 482.553,1112 482,1112 C481.447,1112 481,1111.55 481,1111 L481,1106 L476,1106 C475.447,1106 475,1105.55 475,1105 C475,1104.45 475.447,1104 476,1104 L481,1104 L481,1099 C481,1098.45 481.447,1098 482,1098 C482.553,1098 483,1098.45 483,1099 L483,1104 L488,1104 C488.553,1104 489,1104.45 489,1105 C489,1105.55 488.553,1106 488,1106 L488,1106 Z M482,1089 C473.163,1089 466,1096.16 466,1105 C466,1113.84 473.163,1121 482,1121 C490.837,1121 498,1113.84 498,1105 C498,1096.16 490.837,1089 482,1089 L482,1089 Z" id="plus-circle"></path>
                      </g>
                    </g>
                  </g>
                </svg>
              </button>
            </div>
            <div className="confirm-promo-divider" />
            <div className="confirm-payment-row">
              <span className="payment-label">Số tiền cần thanh toán</span>
              <span className="price-highlight">{totalPriceSum.toLocaleString()} đ</span>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="booking-confirm-inputs">
            <div className="confirm-input-group">
              <label className="confirm-input-label">TÊN CỦA BẠN</label>
              <div className="confirm-input-field-wrapper">
                <input
                  type="text"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="confirm-text-input"
                />
                {bookerName && (
                  <button className="confirm-clear-btn" onClick={() => setBookerName('')}>
                    <X size={12} color="#fff" />
                  </button>
                )}
              </div>
            </div>

            <div className="confirm-input-group">
              <label className="confirm-input-label">SỐ ĐIỆN THOẠI</label>
              <div className="confirm-input-field-wrapper">
                <div className="confirm-country-selector">
                  <span className="country-flag">🇻🇳</span>
                  <span>+ 84</span>
                  <ChevronDown size={14} className="dropdown-arrow" />
                </div>
                <input
                  type="text"
                  value={bookerPhone}
                  onChange={(e) => setBookerPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="confirm-text-input phone-input"
                />
                {bookerPhone && (
                  <button className="confirm-clear-btn" onClick={() => setBookerPhone('')}>
                    <X size={12} color="#fff" />
                  </button>
                )}
              </div>
            </div>

            <div className="confirm-input-group">
              <label className="confirm-input-label">GHI CHÚ CHO CHỦ SÂN</label>
              <div className="confirm-input-field-wrapper">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nhập ghi chú"
                  className="confirm-text-input"
                />
              </div>
            </div>
          </div>

          {/* Notes list */}
          <div className="booking-confirm-warnings">
            <h3 className="warnings-title">⚠️ Lưu ý:</h3>
            <ul className="warnings-list">
              <li>Việc thanh toán được thực hiện trực tiếp giữa bạn và chủ sân.</li>
              <li>SportConnect đóng vai trò kết nối, hỗ trợ bạn tìm và đặt sân dễ dàng hơn.</li>
              <li>Mỗi sân có thể có quy định và chính sách riêng, hãy dành chút thời gian đọc kỹ để đảm bảo quyền lợi cho bạn nhé!</li>
            </ul>
            <p className="warnings-consent">
              Bằng việc bấm Xác nhận và Thanh toán, bạn xác nhận đã đọc và đồng ý với <span className="consent-link">Điều khoản đặt sân</span> và <span className="consent-link">Chính sách hoàn tiền và huỷ lịch</span>.
            </p>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="booking-confirm-footer">
          <button
            onClick={handleConfirmAndPay}
            disabled={isSubmitting}
            className="booking-confirm-action-btn"
          >
            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN & THANH TOÁN'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
