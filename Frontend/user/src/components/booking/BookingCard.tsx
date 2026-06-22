import { Link } from 'react-router-dom';
import { Ban, CheckCircle2, Clock } from 'lucide-react';
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
  booking
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
    </div>
  );
}
