import { useState, useEffect } from 'react';
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
    orderNumber?: number;             // Mã đơn số tự tăng
  };
  index: number;                     // Số thứ tự đơn
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

  const [autoTriggered, setAutoTriggered] = useState(false);
  
  // Chỉ tự động xác nhận nếu đơn sắp bắt đầu trong vòng 30 phút tới (0 <= diffMins <= 30)
  const startTimeMs = new Date(booking.startTime).getTime();
  const diffMins = (startTimeMs - Date.now()) / (1000 * 60);
  const isAutoConfirm = !!onConfirm && (diffMins >= 0 && diffMins <= 30);

  useEffect(() => {
    if (isAutoConfirm && onConfirm && !isConfirming && !autoTriggered) {
      setAutoTriggered(true);
      onConfirm(booking.id);
    }
  }, [isAutoConfirm, onConfirm, booking.id, isConfirming, autoTriggered]);

  const buttonText = isConfirming ? 'ĐANG DUYỆT...' : 'XÁC NHẬN';

  return (
    <div className="booking-card2-container">
      <div className="booking-card2-ribbon-container">
        <RibbonType>{typeText}</RibbonType>
        <RibbonPayment>{paymentText}</RibbonPayment>
        {booking.isExpiringSoon && !isPaid && (
          <Ribbon3>Sắp hết hạn</Ribbon3>
        )}
      </div>

      {/* Nội dung chính và nút xác nhận dạng 2 cột */}
      <div className="booking-card2-content-row">
        {/* Cột trái: Thông tin đặt sân */}
        <div className="booking-card2-info-col">
          <h3 className="booking-card2-customer-name">{booking.customerName}</h3>
          
          <div className="booking-card2-info-item">
            <span>Mã đơn:</span> #{booking.orderNumber || index}
          </div>
          
          <div className="booking-card2-info-item">
            <span>Chi tiết:</span> {detailStr}
          </div>
        </div>

        {/* Cột phải: Nút xác nhận */}
        {onConfirm && (
          <div className="booking-card2-action-col">
            <button
              onClick={() => onConfirm(booking.id)}
              disabled={isConfirming || isAutoConfirm}
              className={`booking-card2-btn-confirm ${isAutoConfirm ? 'auto-disabled' : ''}`}
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
