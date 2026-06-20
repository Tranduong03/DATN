import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Star } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenueDetail } from '../../hooks/queries/usePublicQueries';
import { useVenueAvailability } from '../../hooks/queries/useBookingQueries';
import { useCreateBooking, useGetPaymentUrl } from '../../hooks/mutations/useBookingMutations';
import { useVenueReviews } from '../../hooks/queries/useReviewQueries';
import { formatOperatingHour } from '../../utils/time';

export default function VenueDetailPage() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // [{ courtId, startTime, endTime, price }]
  const [selectedSlots, setSelectedSlots] = useState<{ courtId: string, startTime: string, endTime: string, price: number }[]>([]);

  const { data: venue, isLoading: loadingVenue } = usePublicVenueDetail(venueId!);

  const { data: courtsAvailability = [], isLoading: loadingAvailability } = useVenueAvailability(venueId!, selectedDate);

  const { data: reviews = [] } = useVenueReviews(venueId!);

  const createBookingMutation = useCreateBooking();
  const getPaymentUrlMutation = useGetPaymentUrl();

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

  const handleBook = async () => {
    if (selectedSlots.length === 0) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để đặt sân!');
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
        // Lấy link thanh toán cho booking đầu tiên (hoặc xử lý thanh toán gộp)
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

  if (loadingVenue) return <MainLayout><div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div></MainLayout>;
  if (!venue) return <MainLayout><div style={{ padding: 40, textAlign: 'center' }}>Không tìm thấy sân</div></MainLayout>;

  return (
    <MainLayout>
      <div className="venue-detail-page" style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        <button className="icon-btn" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
          <ChevronLeft /> Quay lại
        </button>

        {/* Venue Info */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          {venue.avatarUrl ? (
            <img 
              src={venue.avatarUrl} 
              alt={venue.name} 
              style={{ width: 300, height: 200, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }} 
            />
          ) : (
            <div style={{ width: 300, height: 200, backgroundColor: '#A8DADC', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d3557', fontSize: 48, fontWeight: 'bold' }}>
              {venue.name?.substring(0, 2).toUpperCase() || 'SC'}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 300 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 700 }}>{venue.name}</h1>
            <div style={{ display: 'flex', gap: 16, color: '#666', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={16} /> {venue.address}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={16} /> {formatOperatingHour(venue.operatingStartHour)} - {formatOperatingHour(venue.operatingEndHour)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F5A623' }}><Star size={16} fill="#F5A623" /> {venue.rating} ({venue.reviewCount} đánh giá)</span>
            </div>
            
            {venue.sportTypes && venue.sportTypes.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {venue.sportTypes.map((sport: string) => (
                  <span 
                    key={sport} 
                    style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600 }}
                  >
                    {sport}
                  </span>
                ))}
              </div>
            )}
            
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{venue.description || 'Chưa có mô tả chi tiết cho sân này.'}</p>
          </div>
        </div>

        {/* Venue Gallery */}
        {venue.galleryImages && venue.galleryImages.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 12 }}>Hình ảnh cơ sở</h3>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {venue.galleryImages.map((img: string, idx: number) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`Gallery ${idx}`} 
                  loading="lazy"
                  style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #e2e8f0' }} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Đánh giá từ người chơi</h3>
          {reviews.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Chưa có đánh giá nào cho sân này.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map((review: any) => (
                <div key={review.id} style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {review.userAvatar ? (
                        <img src={review.userAvatar} alt={review.userName} loading="lazy" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{review.userName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: 8 }}>
                      <Star size={14} fill="#d97706" color="#d97706" />
                      <span style={{ fontWeight: 'bold', color: '#b45309', fontSize: 14 }}>{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p style={{ color: '#475569', margin: '8px 0 0 0', lineHeight: 1.5 }}>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
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
                      const courtSelection = selectedSlots.find(s => s.courtId === court.courtId);
                      const isSelected = courtSelection && 
                                       new Date(slot.startTime) >= new Date(courtSelection.startTime) && 
                                       new Date(slot.endTime) <= new Date(courtSelection.endTime);

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
        {selectedSlots.length > 0 && (
          <div style={{ marginTop: 24, padding: 20, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Thông tin đặt sân ({selectedSlots.length} sân)</h3>
              {selectedSlots.map(s => {
                const courtName = courtsAvailability.find((c:any) => c.courtId === s.courtId)?.courtName;
                return (
                  <p key={s.courtId} style={{ margin: '4px 0 0 0', color: '#475569', fontSize: 14 }}>
                    <strong>{courtName}:</strong> {new Date(s.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, color: '#64748b' }}>Tổng tiền tạm tính</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>
                  {selectedSlots.reduce((sum, s) => sum + s.price, 0).toLocaleString('vi-VN')} đ
                </div>
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
