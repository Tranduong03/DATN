import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Star } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenueDetail } from '../../hooks/queries/usePublicQueries';
import { useVenueAvailability } from '../../hooks/queries/useBookingQueries';
import { useCreateBooking } from '../../hooks/mutations/useBookingMutations';

export default function VenueDetailPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // { courtId: [startTime1, startTime2] }
  const [selectedSlots, setSelectedSlots] = useState<{ courtId: string, startTime: string, endTime: string, price: number } | null>(null);

  const { data: venue, isLoading: loadingVenue } = usePublicVenueDetail(venueId!);

  const { data: courtsAvailability = [], isLoading: loadingAvailability } = useVenueAvailability(venueId!, selectedDate);

  const createBookingMutation = useCreateBooking();

  const handleSlotClick = (courtId: string, slot: any) => {
    if (!slot.isAvailable) return;
    
    // For simplicity right now, selecting a slot overwrites the current selection.
    // To support dragging/multiple blocks, we need a more complex state.
    // The user requested: "Người dùng có thể chọn đặt sân 60 phút, 90 phút... bằng cách chọn điểm đầu và điểm cuối".
    // Since we are clicking, let's just allow selecting one block at first, and then extending it.
    
    if (!selectedSlots) {
      setSelectedSlots({
        courtId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price
      });
    } else {
      // If clicking same court and it's adjacent, extend it
      if (selectedSlots.courtId === courtId) {
        if (slot.startTime === selectedSlots.endTime) {
          setSelectedSlots({
            ...selectedSlots,
            endTime: slot.endTime,
            price: selectedSlots.price + slot.price
          });
          return;
        } else if (slot.endTime === selectedSlots.startTime) {
          setSelectedSlots({
            ...selectedSlots,
            startTime: slot.startTime,
            price: selectedSlots.price + slot.price
          });
          return;
        }
      }
      // Otherwise reset
      setSelectedSlots({
        courtId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price
      });
    }
  };

  const handleBook = async () => {
    if (!selectedSlots) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để đặt sân!');
      navigate('/login');
      return;
    }

    try {
      await createBookingMutation.mutateAsync({
        courtId: selectedSlots.courtId,
        startTime: selectedSlots.startTime,
        endTime: selectedSlots.endTime
      });
      alert('Đặt lịch thành công!');
      setSelectedSlots(null);
      navigate('/me/bookings'); // Or wherever
    } catch (error: any) {
      alert('Lỗi đặt lịch: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loadingVenue) return <MainLayout><div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div></MainLayout>;
  if (!venue) return <MainLayout><div style={{ padding: 40, textAlign: 'center' }}>Không tìm thấy sân</div></MainLayout>;

  return (
    <MainLayout>
      <div className="venue-detail-page" style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        <button className="icon-btn" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
          <ChevronLeft /> Quay lại
        </button>

        {/* Venue Info */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <div style={{ width: 300, height: 200, backgroundColor: '#A8DADC', borderRadius: 12 }}></div>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>{venue.name}</h1>
            <div style={{ display: 'flex', gap: 16, color: '#666', marginBottom: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={16} /> {venue.address}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={16} /> {venue.operatingStartHour} - {venue.operatingEndHour}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F5A623' }}><Star size={16} fill="#F5A623" /> {venue.rating}</span>
            </div>
            <p>{venue.description}</p>
          </div>
        </div>

        {/* Booking Section */}
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Đặt lịch sân</h2>
        
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ccc' }}
          />
        </div>

        {loadingAvailability ? (
          <p>Đang tải lịch trống...</p>
        ) : courtsAvailability.length === 0 ? (
          <p>Sân này chưa có sân con nào hoạt động.</p>
        ) : (
          <div className="booking-grid-container" style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: 12, border: '1px solid #eee', padding: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '2px solid #eee', textAlign: 'left', width: 120, position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 2 }}>Tên Sân</th>
                  {courtsAvailability[0]?.timeSlots.map((slot: any, idx: number) => {
                    const timeStr = new Date(slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <th key={idx} style={{ padding: '12px 4px', borderBottom: '2px solid #eee', minWidth: 60, fontSize: 12, textAlign: 'center' }}>
                        {timeStr}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {courtsAvailability.map((court: any) => (
                  <tr key={court.courtId}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 600, position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 1 }}>
                      {court.courtName}
                    </td>
                    {court.timeSlots.map((slot: any, idx: number) => {
                      // Check if selected
                      const isSelected = selectedSlots && selectedSlots?.courtId === court.courtId && 
                                       new Date(slot.startTime) >= new Date(selectedSlots.startTime) && 
                                       new Date(slot.endTime) <= new Date(selectedSlots.endTime);

                      return (
                        <td key={idx} style={{ padding: 2, borderBottom: '1px solid #eee' }}>
                          <div 
                            onClick={() => handleSlotClick(court.courtId, slot)}
                            style={{
                              height: 40,
                              backgroundColor: isSelected ? '#10b981' : slot.isAvailable ? '#e0f2fe' : '#f3f4f6',
                              color: isSelected ? '#fff' : slot.isAvailable ? '#0369a1' : '#9ca3af',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                              fontSize: 11,
                              fontWeight: isSelected ? 'bold' : 'normal',
                              border: isSelected ? 'none' : '1px solid transparent'
                            }}
                            title={slot.isAvailable ? `Giá: ${slot.price.toLocaleString()}đ` : 'Đã có người đặt'}
                          >
                            {isSelected ? 'Đang chọn' : slot.isAvailable ? (slot.price / 1000) + 'k' : 'Hết'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Checkout Bar */}
        {selectedSlots && (
          <div style={{ marginTop: 24, padding: 20, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Thông tin đặt sân</h3>
              <p style={{ margin: '4px 0 0 0', color: '#475569' }}>
                {new Date(selectedSlots.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(selectedSlots.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                {' '}| Ngày {new Date(selectedSlots.startTime).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, color: '#64748b' }}>Tổng tiền tạm tính</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{selectedSlots.price.toLocaleString('vi-VN')} đ</div>
              </div>
              <button 
                onClick={handleBook}
                disabled={createBookingMutation.isPending}
                style={{ padding: '12px 32px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}
              >
                {createBookingMutation.isPending ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT SÂN'}
              </button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
