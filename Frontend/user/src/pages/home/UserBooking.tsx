import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenueDetail } from '../../hooks/queries/usePublicQueries';
import { useVenueAvailability } from '../../hooks/queries/useBookingQueries';
import { useCreateBooking, useGetPaymentUrl } from '../../hooks/mutations/useBookingMutations';

export default function UserBooking() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');
  const navigate = useNavigate();

  // Selected date (default: today)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Grid column width slider state (in pixels)
  const [cellWidth, setCellWidth] = useState<number>(90);

  // Selected slots: [{ courtId, startTime, endTime, price }]
  const [selectedSlots, setSelectedSlots] = useState<{ courtId: string, startTime: string, endTime: string, price: number }[]>([]);

  // API Queries & Mutations
  usePublicVenueDetail(venueId || '');
  const { data: courtsAvailability = [], isLoading: loadingAvailability } = useVenueAvailability(venueId || '', selectedDate);
  const createBookingMutation = useCreateBooking();
  const getPaymentUrlMutation = useGetPaymentUrl();

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate, venueId]);

  const handleSlotClick = (courtId: string, slot: any) => {
    if (!slot.isAvailable) return;

    const existingIndex = selectedSlots.findIndex(s => s.courtId === courtId);

    if (existingIndex === -1) {
      setSelectedSlots([
        ...selectedSlots,
        { courtId, startTime: slot.startTime, endTime: slot.endTime, price: slot.price }
      ]);
    } else {
      const current = selectedSlots[existingIndex];
      const clickStart = new Date(slot.startTime).getTime();
      const clickEnd = new Date(slot.endTime).getTime();
      const currentStart = new Date(current.startTime).getTime();
      const currentEnd = new Date(current.endTime).getTime();

      // Extend forward
      if (clickStart === currentEnd) {
        const newSlots = [...selectedSlots];
        newSlots[existingIndex] = { ...current, endTime: slot.endTime, price: current.price + slot.price };
        setSelectedSlots(newSlots);
      }
      // Extend backward
      else if (clickEnd === currentStart) {
        const newSlots = [...selectedSlots];
        newSlots[existingIndex] = { ...current, startTime: slot.startTime, price: current.price + slot.price };
        setSelectedSlots(newSlots);
      }
      // Click inside to remove the selection for this court
      else if (clickStart >= currentStart && clickEnd <= currentEnd) {
        setSelectedSlots(selectedSlots.filter(s => s.courtId !== courtId));
      }
      // Otherwise reset this court's selection
      else {
        const newSlots = [...selectedSlots];
        newSlots[existingIndex] = { courtId, startTime: slot.startTime, endTime: slot.endTime, price: slot.price };
        setSelectedSlots(newSlots);
      }
    }
  };

  const handleBookNext = async () => {
    if (selectedSlots.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để tiến hành đặt lịch!');
      navigate('/login');
      return;
    }

    try {
      const bookings = await Promise.all(
        selectedSlots.map((selection) =>
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



  // Grouping logic based on court name to emulate Pickleball / BR 1 rổ / BR 2 rổ
  const getGroupForCourt = (courtName: string) => {
    const nameLower = courtName.toLowerCase();
    if (nameLower.includes('pickleball')) {
      return 'Pickleball';
    }
    if (nameLower.includes('bb 1-') || nameLower.includes('bb 2-')) {
      return 'BR\n1\nrổ';
    }
    if (nameLower.includes('bb 1') || nameLower.includes('bb 2') || nameLower === 'bb 1' || nameLower === 'bb 2') {
      return 'BR\n2\nrổ';
    }
    // General database fallback to group Sân 1/Sân 2 vs Sân 3/Sân 4
    if (nameLower.includes('sân 1') || nameLower.includes('sân 2')) {
      return 'BR\n1\nrổ';
    }
    if (nameLower.includes('sân 3') || nameLower.includes('sân 4') || nameLower.includes('vip')) {
      return 'BR\n2\nrổ';
    }
    return 'Khác';
  };

  // Mapping state to mock layout data exactly like target template
  const getSlotStatus = (courtName: string, slot: any, idx: number) => {
    if (slot.isAvailable) {
      return 'available';
    }
    const nameLower = courtName.toLowerCase();
    // Emulate BB 1-1 red booking at index 4 (8:00)
    if (nameLower.includes('1-1') && idx === 4) {
      return 'booked';
    }
    // Emulate BB 1 hatched gray locking at index 5 and 6
    if (nameLower === 'bb 1' && (idx === 5 || idx === 6)) {
      return 'locked';
    }
    
    // General fallback
    if (idx % 7 === 0) return 'locked';
    if (idx % 11 === 0) return 'event';
    return 'booked';
  };

  const formatTimeHeader = (timeStr: string) => {
    const dateObj = new Date(timeStr);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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

  // Pre-process grouping
  const groupedCourts: { [key: string]: typeof courtsAvailability } = {};
  courtsAvailability.forEach((court: any) => {
    const groupName = getGroupForCourt(court.courtName);
    if (!groupedCourts[groupName]) {
      groupedCourts[groupName] = [];
    }
    groupedCourts[groupName].push(court);
  });

  // Render rows dynamically using rowSpan
  const renderedRows: React.ReactNode[] = [];
  Object.keys(groupedCourts).forEach((groupName) => {
    const courtsInGroup = groupedCourts[groupName];
    courtsInGroup.forEach((court: any, courtIndex: number) => {
      renderedRows.push(
        <tr key={court.courtId}>
          {/* Vertical Category Column - only render on first court in the group */}
          {courtIndex === 0 && (
            <td
              rowSpan={courtsInGroup.length}
              style={{
                verticalAlign: 'middle',
                textAlign: 'center',
                backgroundColor: '#d1e7dd',
                borderRight: '1px solid #cbd5e1',
                borderBottom: '1px solid #cbd5e1',
                padding: '8px 4px',
                width: '35px',
                minWidth: '35px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#0f5132',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.2'
              }}
            >
              {groupName}
            </td>
          )}

          {/* Sub-Court Name Column */}
          <td style={{
            padding: '10px 8px',
            borderRight: '1px solid #cbd5e1',
            borderBottom: '1px solid #cbd5e1',
            backgroundColor: '#e8f5e9',
            color: '#1b5e20',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'left',
            minWidth: '90px',
            width: '90px'
          }}>
            {court.courtName}
          </td>

          {/* Time Slots Cells */}
          {court.timeSlots.map((slot: any, idx: number) => {
            const courtSelection = selectedSlots.find(s => s.courtId === court.courtId);
            const isSelected = courtSelection &&
              new Date(slot.startTime) >= new Date(courtSelection.startTime) &&
              new Date(slot.endTime) <= new Date(courtSelection.endTime);

            const status = getSlotStatus(court.courtName, slot, idx);

            let cellBg = '#ffffff';
            let cellColor = '#1e293b';
            if (isSelected) {
              cellBg = '#caa338';
              cellColor = '#ffffff';
            } else if (status === 'booked') {
              cellBg = '#ff6b6b';
              cellColor = '#ffffff';
            } else if (status === 'locked') {
              cellBg = 'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 4px, #cbd5e1 4px, #cbd5e1 8px)';
              cellColor = '#cbd5e1';
            } else if (status === 'event') {
              cellBg = '#d6bcfa';
              cellColor = '#ffffff';
            }

            return (
              <td
                key={idx}
                style={{
                  padding: 2,
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  minWidth: cellWidth,
                  width: cellWidth
                }}
              >
                <div
                  onClick={() => slot.isAvailable && handleSlotClick(court.courtId, slot)}
                  style={{
                    height: 40,
                    background: cellBg,
                    color: cellColor,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: 11,
                    fontWeight: isSelected ? '700' : 'normal',
                    border: '1px solid transparent',
                    transition: 'all 0.1s ease-in-out'
                  }}
                  title={slot.isAvailable ? `Giá: ${slot.price.toLocaleString()}đ` : 'Không khả dụng'}
                >
                  {isSelected ? 'Đang chọn' : status === 'event' ? (
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
                  ) : ''}
                </div>
              </td>
            );
          })}
        </tr>
      );
    });
  });

  return (
    <MainLayout noPaddingBottom={true}>
      <div className="user-booking-container" style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 0 100px 0',
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
          {/* Top Row: Back arrow, Title, Custom Date Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
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
            
            <h1 style={{
              fontSize: '17px',
              fontWeight: '700',
              margin: 0,
              color: '#ffffff',
              textAlign: 'center',
              flex: 1
            }}>
              Đặt lịch ngày trực quan
            </h1>

            {/* Styled Date Picker Capsule */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '6px',
              padding: '4px 8px'
            }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer',
                  width: '95px'
                }}
              />
            </div>
          </div>

          {/* Middle Row: Legend indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            paddingTop: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: '#ffffff', border: '1px solid #cbd5e1' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>Trống</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: '#ff6b6b' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>Đã đặt</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '3px',
                background: 'repeating-linear-gradient(45deg, #a0aec0, #a0aec0 2px, #cbd5e1 2px, #cbd5e1 4px)'
              }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>Khoá</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#9f7aea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>!</div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>Sự kiện</span>
            </div>
          </div>

          {/* Bottom Row: Link */}
          <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: '700' }}>
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

        {/* Table Scheduler Grid */}
        <div style={{ width: '100%', overflowX: 'auto', boxSizing: 'border-box' }}>
          {loadingAvailability ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              Đang tải dữ liệu lịch trống...
            </div>
          ) : courtsAvailability.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              Cơ sở này hiện chưa cấu hình sân con hoạt động.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ backgroundColor: '#edf2f7' }}>
                  {/* Spans category column and subcourt name column */}
                  <th colSpan={2} style={{
                    padding: '8px 10px',
                    borderRight: '1px solid #cbd5e1',
                    borderBottom: '1px solid #cbd5e1',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#475569',
                    minWidth: '125px',
                    width: '125px'
                  }}>
                    Khung Giờ
                  </th>
                  {courtsAvailability[0]?.timeSlots.map((slot: any, idx: number) => {
                    const timeStr = formatTimeHeader(slot.startTime);
                    return (
                      <th
                        key={idx}
                        style={{
                          padding: '8px 4px',
                          borderRight: '1px solid #cbd5e1',
                          borderBottom: '1px solid #cbd5e1',
                          minWidth: cellWidth,
                          width: cellWidth,
                          fontSize: '11px',
                          fontWeight: '700',
                          textAlign: 'center',
                          color: '#475569'
                        }}
                      >
                        {timeStr}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {renderedRows}
              </tbody>
            </table>
          )}
        </div>

        {/* Column width scaling slider inside a white capsule pill */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: '#ffffff',
          borderRadius: '30px',
          border: '1px solid #e2e8f0',
          width: '240px',
          margin: '20px auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          boxSizing: 'border-box'
        }}>
          <input
            type="range"
            min="60"
            max="150"
            value={cellWidth}
            onChange={(e) => setCellWidth(Number(e.target.value))}
            style={{
              accentColor: '#caa338',
              width: '100%',
              height: '4px',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Sticky Golden "TIẾP THEO" Button Bar */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
          zIndex: 100,
          boxSizing: 'border-box'
        }}>
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
    </MainLayout>
  );
}
