import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenueDetail, useSportCategories } from '../../hooks/queries/usePublicQueries';
import { useVenueAvailability } from '../../hooks/queries/useBookingQueries';
import BookingGrid from '../../components/booking/BookingGrid';

export default function UserBooking() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');
  const navigate = useNavigate();

  // Selected date (default: today)
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(
    getLocalDateString(new Date())
  );

  // Selected slots: [{ courtId, courtName, startTime, endTime, price }]
  const [selectedSlots, setSelectedSlots] = useState<{
    courtId: string;
    courtName: string;
    startTime: string;
    endTime: string;
    price: number;
  }[]>([]);

  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // API Queries & Mutations
  const { data: venue } = usePublicVenueDetail(venueId || '');
  const { data: courtsAvailability = [], isLoading: loadingAvailability } = useVenueAvailability(venueId || '', selectedDate);
  const { data: sportsCategories = [] } = useSportCategories();

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate, venueId]);

  const handleSlotClick = (courtId: string, courtName: string, slot: any) => {
    const isAlreadySelected = selectedSlots.some(
      s => s.courtId === courtId && s.startTime === slot.startTime
    );

    if (isAlreadySelected) {
      setSelectedSlots(selectedSlots.filter(
        s => !(s.courtId === courtId && s.startTime === slot.startTime)
      ));
    } else {
      setSelectedSlots([
        ...selectedSlots,
        { courtId, courtName, startTime: slot.startTime, endTime: slot.endTime, price: slot.price }
      ]);
    }
  };

  // Grouping contiguous slots of the same court
  const getGroupedBookings = () => {
    const byCourt: { [courtId: string]: typeof selectedSlots } = {};
    selectedSlots.forEach(s => {
      if (!byCourt[s.courtId]) byCourt[s.courtId] = [];
      byCourt[s.courtId].push(s);
    });

    const grouped: { courtId: string; courtName: string; startTime: string; endTime: string; price: number }[] = [];

    Object.keys(byCourt).forEach(courtId => {
      const courtSlots = byCourt[courtId];
      // Sort chronologically
      courtSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      if (courtSlots.length === 0) return;

      let currentBlock = { ...courtSlots[0] };

      for (let i = 1; i < courtSlots.length; i++) {
        const nextSlot = courtSlots[i];
        const currentEnd = new Date(currentBlock.endTime).getTime();
        const nextStart = new Date(nextSlot.startTime).getTime();

        if (currentEnd === nextStart) {
          // Contiguous, merge
          currentBlock.endTime = nextSlot.endTime;
          currentBlock.price += nextSlot.price;
        } else {
          // Push current, start new block
          grouped.push(currentBlock);
          currentBlock = { ...nextSlot };
        }
      }
      grouped.push(currentBlock);
    });

    return grouped;
  };

  const groupedBookings = getGroupedBookings();
  const totalPriceSum = selectedSlots.reduce((sum, s) => sum + s.price, 0);

  const totalHoursStr = (() => {
    const totalMinutes = selectedSlots.reduce((sum, slot) => {
      const diff = new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime();
      return sum + (diff / 60000);
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  })();

  const handleBookNext = () => {
    if (groupedBookings.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để tiến hành đặt lịch!');
      navigate('/login');
      return;
    }

    navigate('/UserBooking/confirm', {
      state: {
        venueId,
        selectedDate,
        groupedBookings,
        totalPriceSum,
        totalHoursStr
      }
    });
  };

  const formatTimeHeader = (timeStr: string) => {
    const dateObj = new Date(timeStr);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}h${minutes}`;
  };

  // Generate next 14 days for date carousel
  const dateList = Array.from({ length: 14 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    return d;
  });

  const getDayOfWeekName = (dateObj: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const todayStr = getLocalDateString(new Date());
    const targetStr = getLocalDateString(dateObj);
    if (todayStr === targetStr) {
      return 'Hôm nay';
    }
    return days[dateObj.getDay()];
  };

  if (!venueId) {
    return (
      <MainLayout noPaddingBottom={true}>
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          Yêu cầu mã sân (venueId) hợp lệ để thực hiện đặt lịch.
        </div>
      </MainLayout>
    );
  }

  const activeIndex = (() => {
    const idx = dateList.findIndex(d => getLocalDateString(d) === selectedDate);
    if (idx !== -1) return idx;
    return 14;
  })();

  return (
    <MainLayout noPaddingBottom={true}>
      <div className="user-booking-container">
        {/* Dark Green Header Box */}
        <div className="booking-header-box">
          {/* Top Row: Back arrow, Title */}
          <div className="booking-header-top-row">
            <button
              onClick={() => navigate(-1)}
              className="booking-back-btn"
            >
              <ChevronLeft size={24} color="#ffffff" />
            </button>
            
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 className="booking-header-title">
                Đặt lịch ngày trực quan
              </h1>
            </div>

            <div style={{ width: 24 }} /> {/* Spacer to balance back arrow */}
          </div>

          {/* Middle Row: Legend indicators */}
          <div className="booking-legend-container">
            <div className="booking-legend-item">
              <div className="booking-legend-color available" />
              <span className="booking-legend-text">Trống</span>
            </div>

            <div className="booking-legend-item">
              <div className="booking-legend-color selected" />
              <span className="booking-legend-text">Đang chọn</span>
            </div>

            <div className="booking-legend-item">
              <div className="booking-legend-color booked" />
              <span className="booking-legend-text">Đã đặt</span>
            </div>

            <div className="booking-legend-item">
              <div className="booking-legend-color locked" />
              <span className="booking-legend-text">Khoá</span>
            </div>
          </div>

          {/* Bottom Row: Link */}
          <div className="booking-header-link-row">
            <a
              onClick={() => navigate(`/venue/${venueId}`)}
              className="booking-header-link"
            >
              Xem sân & bảng giá
            </a>
          </div>
        </div>

        {/* Warning Banner block */}
        <div className="booking-warning-banner">
          <span className="warning-label">Lưu ý: </span>
          <span className="warning-text">
            Nếu bạn cần đặt lịch cố định vui lòng liên hệ: {venue?.contactPhone || 'SĐT liên hệ'} để được hỗ trợ
          </span>
        </div>

        {/* Horizontal Date Picker Carousel */}
        <div className="booking-date-carousel">
          <div 
            className="booking-date-active-indicator"
            style={{ transform: `translateX(${activeIndex * 66}px)` }}
          />
          {dateList.map((dateObj) => {
            const dateStr = getLocalDateString(dateObj);
            const isSelected = dateStr === selectedDate;
            const dayName = getDayOfWeekName(dateObj);
            const dayNum = dateObj.getDate();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`booking-date-btn ${isSelected ? 'active' : ''}`}
              >
                <span className="booking-date-btn-day">
                  {dayName}
                </span>
                <span className="booking-date-btn-num">
                  {dayNum}
                </span>
              </button>
            );
          })}
          
          {/* Custom Date Input wrapper button */}
          <div className={`booking-date-custom-wrapper ${activeIndex === 14 ? 'active' : ''}`}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="booking-date-custom-input"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>

        {/* Table Scheduler Grid */}
        <div style={{ width: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
          <BookingGrid
            courtsAvailability={courtsAvailability}
            selectedSlots={selectedSlots}
            onSlotClick={handleSlotClick}
            loadingAvailability={loadingAvailability}
            sportsCategories={sportsCategories}
          />
        </div>

        {/* Floating/Fixed bottom area containing Summary + Confirm Button */}
        <div className={`booking-bottom-action-bar ${selectedSlots.length > 0 ? 'has-slots' : ''}`}>
          {selectedSlots.length > 0 && (
            <>
              {/* Expand/Collapse Toggle */}
              <div 
                className="booking-summary-toggle"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              >
                {isSummaryExpanded ? (
                  <ChevronDown size={20} color="#ffffff" />
                ) : (
                  <ChevronUp size={20} color="#ffffff" />
                )}
              </div>

              {/* Summary Panel inside the sticky bar */}
              {isSummaryExpanded && (
                <div className="booking-summary-panel">
                  <div className="booking-summary-list">
                    {groupedBookings.map((booking, idx) => {
                      const startHourStr = formatTimeHeader(booking.startTime);
                      const endHourStr = formatTimeHeader(booking.endTime);
                      return (
                        <div key={idx} className="booking-summary-row">
                          <span>
                            {booking.courtName}: {startHourStr} - {endHourStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Thin white divider line */}
              {isSummaryExpanded && <div className="booking-summary-divider" />}

              {/* Total hours and total price */}
              <div className="booking-summary-total-row">
                <span>Tổng giờ: {totalHoursStr}</span>
                <span>
                  Tổng tiền: {totalPriceSum.toLocaleString('vi-VN')}{' '}
                  <span style={{ textDecoration: 'underline' }}>đ</span>
                </span>
              </div>
            </>
          )}

          {/* Action Button */}
          <div className="booking-confirm-btn-wrapper">
            <button
              onClick={handleBookNext}
              disabled={selectedSlots.length === 0}
              className="booking-confirm-btn"
            >
              TIẾP THEO
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
