import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenueDetail, useSportCategories } from '../../hooks/queries/usePublicQueries';
import { useVenueAvailability } from '../../hooks/queries/useBookingQueries';
import { useCreateBooking, useGetPaymentUrl } from '../../hooks/mutations/useBookingMutations';
import BookingGrid from '../../components/booking/BookingGrid';

export default function UserBooking() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');
  const navigate = useNavigate();

  // Selected date (default: today)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Selected slots: [{ courtId, courtName, startTime, endTime, price }]
  const [selectedSlots, setSelectedSlots] = useState<{
    courtId: string;
    courtName: string;
    startTime: string;
    endTime: string;
    price: number;
  }[]>([]);

  // API Queries & Mutations
  const { data: venue } = usePublicVenueDetail(venueId || '');
  const { data: courtsAvailability = [], isLoading: loadingAvailability } = useVenueAvailability(venueId || '', selectedDate);
  const { data: sportsCategories = [] } = useSportCategories();
  const createBookingMutation = useCreateBooking();
  const getPaymentUrlMutation = useGetPaymentUrl();

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

  const handleBookNext = async () => {
    if (groupedBookings.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để tiến hành đặt lịch!');
      navigate('/login');
      return;
    }

    try {
      const bookings = await Promise.all(
        groupedBookings.map((selection) =>
          createBookingMutation.mutateAsync({
            courtId: selection.courtId,
            startTime: selection.startTime,
            endTime: selection.endTime,
          })
        )
      );

      setSelectedSlots([]);

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
    }
  };

  const formatTimeHeader = (timeStr: string) => {
    const dateObj = new Date(timeStr);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Generate next 14 days for date carousel
  const dateList = Array.from({ length: 14 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    return d;
  });

  const getDayOfWeekName = (dateObj: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const todayStr = new Date().toISOString().split('T')[0];
    const targetStr = dateObj.toISOString().split('T')[0];
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

  return (
    <MainLayout noPaddingBottom={true}>
      <div className="user-booking-container" style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 0 180px 0', // larger padding to clear summary + action buttons
        fontFamily: "'Montserrat', sans-serif",
        color: '#1e293b',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Dark Green Header Box */}
        <div style={{
          backgroundColor: '#02471f',
          padding: '16px 16px 14px 16px',
          color: '#ffffff',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Top Row: Back arrow, Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft size={24} color="#ffffff" />
            </button>
            
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{
                fontSize: '17px',
                fontWeight: '700',
                margin: 0,
                color: '#ffffff'
              }}>
                Đặt lịch ngày trực quan
              </h1>
              {venue && (
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '2px 0 0 0',
                  fontWeight: '600'
                }}>
                  {venue.name}
                </p>
              )}
            </div>

            <div style={{ width: 24 }} /> {/* Spacer to balance back arrow */}
          </div>

          {/* Middle Row: Legend indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#ffffff', border: '1px solid #cbd5e1' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff' }}>Trống</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#14b8a6', border: '1px solid #000' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff' }}>Đang chọn</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#ff6b6b' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff' }}>Đã đặt</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                background: 'repeating-linear-gradient(45deg, #a0aec0, #a0aec0 2px, #cbd5e1 2px, #cbd5e1 4px)'
              }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff' }}>Khoá</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#9f7aea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 'bold'
              }}>!</div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff' }}>Sự kiện</span>
            </div>
          </div>

          {/* Bottom Row: Link */}
          <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: '700', textAlign: 'center' }}>
            <a
              onClick={() => navigate(`/venue/${venueId}`)}
              style={{ color: '#f6ad55', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Xem sân & bảng giá
            </a>
          </div>
        </div>

        {/* Warning Banner block */}
        <div style={{
          backgroundColor: '#ebfaf0',
          borderBottom: '1px solid #c3e6cb',
          padding: '10px 16px',
          fontSize: '12px',
          lineHeight: '1.4',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span style={{ color: '#ef4444', fontWeight: '700' }}>Lưu ý: </span>
          <span style={{ color: '#0a4d28', fontWeight: '600' }}>
            Nếu bạn cần đặt lịch cố định vui lòng liên hệ: 0764.002.002 để được hỗ trợ
          </span>
        </div>

        {/* Horizontal Date Picker Carousel */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '10px',
          padding: '12px 16px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box'
        }}>
          {dateList.map((dateObj) => {
            const dateStr = dateObj.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const dayName = getDayOfWeekName(dateObj);
            const dayNum = dateObj.getDate();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: '56px',
                  height: '64px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid #02471f' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#02471f' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  padding: '6px 4px',
                  boxShadow: isSelected ? '0 4px 6px -1px rgba(2, 71, 31, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: '600', opacity: isSelected ? 0.9 : 0.7 }}>
                  {dayName}
                </span>
                <span style={{ fontSize: '18px', fontWeight: '700', marginTop: '2px' }}>
                  {dayNum}
                </span>
              </button>
            );
          })}
          
          {/* Custom Date Input wrapper button */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: '56px',
            height: '64px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 10
              }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
          zIndex: 100,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Summary Panel inside the sticky bar */}
          {selectedSlots.length > 0 && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#02471f', marginBottom: '6px' }}>
                Chi tiết lịch đặt ({selectedSlots.length} ô giờ):
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {groupedBookings.map((booking, idx) => {
                  const startHourStr = formatTimeHeader(booking.startTime);
                  const endHourStr = formatTimeHeader(booking.endTime);
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#475569'
                    }}>
                      <span>
                        {booking.courtName}: <strong style={{ color: '#0f5132' }}>{startHourStr} - {endHourStr}</strong>
                      </span>
                      <span style={{ fontWeight: '700', color: '#0f5132' }}>
                        {booking.price.toLocaleString()}đ
                      </span>
                    </div>
                  );
                })}
                <div style={{
                  height: '1px',
                  backgroundColor: '#e2e8f0',
                  margin: '4px 0'
                }} />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#02471f'
                }}>
                  <span>Tổng tiền tạm tính:</span>
                  <span>{totalPriceSum.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div style={{ padding: '12px 16px' }}>
            <button
              onClick={handleBookNext}
              disabled={createBookingMutation.isPending || selectedSlots.length === 0}
              style={{
                width: '100%',
                backgroundColor: selectedSlots.length > 0 ? '#caa338' : '#e2e8f0',
                color: selectedSlots.length > 0 ? '#ffffff' : '#a0aec0',
                border: 'none',
                borderRadius: '6px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: selectedSlots.length > 0 ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase',
                boxShadow: selectedSlots.length > 0 ? '0 4px 12px rgba(202, 163, 56, 0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {createBookingMutation.isPending ? 'Đang xử lý...' : 'TIẾP THEO'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
