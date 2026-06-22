import { Check } from 'lucide-react';
import Ribbon1a from '../ui/Ribbon1a';
import Ribbon1b from '../ui/Ribbon1b';
import Ribbon2a from '../ui/Ribbon2a';
import Ribbon2b from '../ui/Ribbon2b';
import Ribbon3 from '../ui/Ribbon3';
import './BookingCard2.css';

export interface BookingCard2Props {
  booking: {
    id: string;
    customerName: string;            // Tên người đặt lịch
    courtName: string;               // Số sân (ví dụ: Sân 4)
    startTime: string;               // Thời gian bắt đầu
    endTime: string;                 // Thời gian kết thúc
    bookingType: 'DAILY' | 'FIXED' | string; // Đơn ngày / Đơn cố định
    paymentStatus: 'PAID' | 'UNPAID' | string; // Đã thanh toán / Chưa thanh toán
    isExpiringSoon?: boolean;         // Sắp hết hạn
  };
  index: number;                     // Số thứ tự đơn, tăng dần từ 0
  onConfirm?: (bookingId: string) => void; // Hàm xử lý nút xác nhận
  isConfirming?: boolean;            // Trạng thái đang xác nhận (loading)
}

export default function BookingCard2({
  booking,
  index,
  onConfirm,
  isConfirming = false
}: BookingCard2Props) {
  // Format short time: e.g. 16h, 18h30
  const formatTimeShort = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return minutes === 0 ? `${hours}h` : `${hours}h${minutes.toString().padStart(2, '0')}`;
    } catch {
      return timeStr;
    }
  };

  // Format short date: dd/MM/yyyy
  const formatDateShort = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return timeStr;
    }
  };

  const detailStr = `${booking.courtName}: ${formatTimeShort(booking.startTime)} - ${formatTimeShort(booking.endTime)} | Ngày ${formatDateShort(booking.startTime)}`;

  // Xác định Ribbon 1 (loại đơn)
  const isFixed = booking.bookingType?.toUpperCase() === 'FIXED';
  const RibbonType = isFixed ? Ribbon1b : Ribbon1a;
  const typeText = isFixed ? 'Đơn cố định' : 'Đơn ngày';

  // Xác định Ribbon 2 (trạng thái thanh toán)
  const isPaid = booking.paymentStatus?.toUpperCase() === 'PAID';
  const RibbonPayment = isPaid ? Ribbon2a : Ribbon2b;
  const paymentText = isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';

  return (
    <div className="booking-card2-container">
      {/* Ribbon 1: Loại đơn đặt (góc trái trên) */}
      <RibbonType>{typeText}</RibbonType>

      {/* Nhóm Ribbon/Badge góc phải trên */}
      <div className="booking-card2-badges-wrapper">
        {/* Ribbon 2: Trạng thái thanh toán */}
        <RibbonPayment>{paymentText}</RibbonPayment>

        {/* Ribbon 3: Cảnh báo sắp hết hạn (nếu có và chưa thanh toán) */}
        {booking.isExpiringSoon && !isPaid && (
          <Ribbon3>Sắp hết hạn</Ribbon3>
        )}
      </div>

      {/* Nội dung chính của Card */}
      <div className="booking-card2-body">
        <div className="booking-card2-header-row">
          <div className="booking-card2-customer-box">
            <span className="booking-card2-customer-label">Người đặt</span>
            <span className="booking-card2-customer-name">{booking.customerName}</span>
          </div>
          <span className="booking-card2-code">Đơn #{index}</span>
        </div>

        <div className="booking-card2-details-box">
          <div className="booking-card2-detail-text">
            Chi tiết: <span className="booking-card2-detail-bold">{detailStr}</span>
          </div>
        </div>
      </div>

      {/* Nút xác nhận ở Footer */}
      {onConfirm && (
        <div className="booking-card2-footer">
          <button
            onClick={() => onConfirm(booking.id)}
            disabled={isConfirming}
            className="booking-card2-btn-confirm"
          >
            <Check size={14} />
            {isConfirming ? 'Đang xác nhận...' : 'Xác nhận'}
          </button>
        </div>
      )}
    </div>
  );
}
