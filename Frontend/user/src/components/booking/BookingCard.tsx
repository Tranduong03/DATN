import { Link } from 'react-router-dom';
import { CreditCard, Trophy, Star, Ban, CheckCircle2, Clock } from 'lucide-react';
import './BookingCard.css';

interface BookingCardProps {
  booking: {
    id: string;
    venueId: string;
    venueName: string;
    venueAddress?: string;
    courtId: string;
    courtName: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  };
  onPayNow: (bookingId: string) => void;
  onCreateMatch: (booking: any) => void;
  onReview: (booking: any) => void;
  isPaying: boolean;
}

export default function BookingCard({
  booking,
  onPayNow,
  onCreateMatch,
  onReview,
  isPaying
}: BookingCardProps) {
  // Format short time: e.g. 8h30 or 9h
  const formatTimeShort = (timeStr: string) => {
    const date = new Date(timeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return minutes === 0 ? `${hours}h` : `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  // Format short date: dd/MM/yyyy
  const formatDateShort = (timeStr: string) => {
    const date = new Date(timeStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          text: 'Đã xác nhận',
          color: '#10b981',
          bgCircle: '#10b981',
          icon: <CheckCircle2 size={14} color="#ffffff" />
        };
      case 'CANCELLED':
        return {
          text: 'Đã hủy',
          color: '#e07242',
          bgCircle: '#e07242',
          icon: <Ban size={14} color="#ffffff" />
        };
      case 'PENDING':
      default:
        return {
          text: 'Chờ thanh toán',
          color: '#3b82f6',
          bgCircle: '#3b82f6',
          icon: <Clock size={14} color="#ffffff" />
        };
    }
  };

  const statusCfg = getStatusConfig(booking.status);
  const detailStr = `${booking.courtName}: ${formatTimeShort(booking.startTime)} - ${formatTimeShort(booking.endTime)} | Ngày ${formatDateShort(booking.startTime)}`;
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="booking-item-card">
      {/* 3D Ribbon */}
      <div className="booking-card-ribbon">
        Đơn ngày
      </div>

      <div className="booking-card-main-header">
        <h3 className="booking-card-venue-title">
          <Link to={`/venue/${booking.venueId}`} className="booking-card-venue-link">
            {booking.venueName}
          </Link>
        </h3>
        
        <div className="booking-card-status-wrapper">
          <span className="booking-card-status-text" style={{ color: statusCfg.color }}>
            {statusCfg.text}
          </span>
          <div className="booking-card-status-icon-circle" style={{ backgroundColor: statusCfg.bgCircle }}>
            {statusCfg.icon}
          </div>
        </div>
      </div>

      <div className="booking-card-body-details">
        <div className="booking-card-detail-line">
          Chi tiết: <span className="bold">{detailStr}</span>
        </div>
        <div className="booking-card-detail-line">
          Địa chỉ: <span className="bold">{booking.venueAddress || 'Chưa cập nhật'}</span>
        </div>
      </div>

      <div className="booking-card-footer">
        <div className="booking-card-actions">
          {booking.status === 'PENDING' && (
            <button
              onClick={() => onPayNow(booking.id)}
              disabled={isPaying}
              className="booking-card-btn booking-btn-pay"
            >
              <CreditCard size={14} />
              {isPaying ? 'Đang tải...' : 'Thanh toán ngay'}
            </button>
          )}

          {booking.status === 'CONFIRMED' && (
            <div className="booking-card-action-group">
              <button
                onClick={() => onCreateMatch(booking)}
                className="booking-card-btn booking-btn-match"
              >
                <Trophy size={14} />
                Tạo kèo (Tìm đối)
              </button>
              <button
                onClick={() => onReview(booking)}
                className="booking-card-btn booking-btn-review"
              >
                <Star size={14} />
                Đánh giá
              </button>
            </div>
          )}
        </div>

        <div className="booking-card-price-container">
          <span className="booking-card-price-label">Tổng thanh toán</span>
          <span className="booking-card-price-value">{formatPrice(booking.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
