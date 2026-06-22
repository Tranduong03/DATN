import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OwnerLayout from './OwnerLayout';
import { useOwnerBookings } from '../../hooks/queries/useBookingQueries';
import { useUpdateBookingStatus } from '../../hooks/mutations/useBookingMutations';
import { Search, ShieldAlert } from 'lucide-react';
import BookingCard2 from '../../components/booking/BookingCard2';

interface BookingItem {
  id: string;
  bookerName?: string;
  bookerPhone?: string;
  status: string;
  courtName: string;
  totalPrice: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  bookingType?: string; // DAILY hoặc FIXED
}

export default function OwnerBookingsPage() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status'); // e.g. 'PENDING'
  
  const { data: bookingsData, isLoading } = useOwnerBookings();
  const updateStatusMutation = useUpdateBookingStatus();
  
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  
  // State quản lý tab phụ trong màn duyệt đơn
  const [approvalTab, setApprovalTab] = useState<'BOOKING' | 'SERVICE' | 'MEMBER_CARD' | 'SERVICE_ORDER'>('BOOKING');

  // Synchronize URL search params with active filter state
  useEffect(() => {
    if (statusParam === 'PENDING') {
      setFilterStatus('PENDING');
      setApprovalTab('BOOKING');
    } else {
      setFilterStatus('ALL');
    }
  }, [statusParam]);

  const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.data || [];

  // Tính số lượng đơn đang chờ duyệt (PENDING)
  const pendingCount = bookings.filter((b: any) => b.status === 'PENDING').length || 0;

  const handleUpdateStatus = (id: string, status: string) => {
    const actionText = status === 'CONFIRMED' ? 'xác nhận đơn đặt này' : 'hủy đơn đặt này';
    if (confirm(`Bạn có chắc chắn muốn ${actionText}?`)) {
      updateStatusMutation.mutate({ bookingId: id, status });
    }
  };

  const filteredBookings = bookings.filter((b: BookingItem) => {
    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchSearch = (b.bookerName || '').toLowerCase().includes(search.toLowerCase()) || 
                        (b.bookerPhone || '').includes(search);
    return matchStatus && matchSearch;
  });

  // Determine Title based on page context
  const isPendingView = filterStatus === 'PENDING';
  const pageTitle = isPendingView ? 'Duyệt đơn đặt sân' : 'Lịch đặt sân';

  return (
    <OwnerLayout title={pageTitle} showSystemHeader={true}>
      <div className="owner-bookings-wrapper" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Search & Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Tìm theo tên, SĐT khách..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: 13 }}
            />
          </div>

          {/* Render tabs duyệt đơn khi đang lọc PENDING (Duyệt đơn) */}
          {statusParam === 'PENDING' ? (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { label: `Đơn cần duyệt (${pendingCount})`, value: 'BOOKING' },
                { label: 'Dịch vụ cần duyệt (0)', value: 'SERVICE' },
                { label: 'Thẻ hội viên cần (0)', value: 'MEMBER_CARD' },
                { label: 'Duyệt đơn dịch vụ (0)', value: 'SERVICE_ORDER' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setApprovalTab(tab.value as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: 'none',
                    backgroundColor: approvalTab === tab.value ? '#047857' : '#e2e8f0',
                    color: approvalTab === tab.value ? '#ffffff' : '#475569',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            /* Quick status tabs (chỉ hiện khi xem toàn bộ lịch đặt sân bình thường) */
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { label: 'Tất cả', value: 'ALL' },
                { label: 'Chờ duyệt', value: 'PENDING' },
                { label: 'Đã nhận', value: 'CONFIRMED' },
                { label: 'Đã hủy', value: 'CANCELLED' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setFilterStatus(tab.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: 'none',
                    backgroundColor: filterStatus === tab.value ? '#047857' : '#e2e8f0',
                    color: filterStatus === tab.value ? '#ffffff' : '#475569',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bookings Card List */}
        {isLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p style={{ fontSize: 13, color: '#64748b' }}>Đang tải danh sách...</p>
          </div>
        ) : statusParam === 'PENDING' && approvalTab !== 'BOOKING' ? (
          /* Render tab placeholder cho các tab phát triển sau */
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', backgroundColor: '#fff', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
            <ShieldAlert size={36} style={{ color: '#94a3b8', marginBottom: 8, margin: '0 auto' }} />
            <div style={{ fontWeight: 700, color: '#475569', fontSize: 14 }}>Tính năng đang phát triển</div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Tính năng duyệt này sẽ được cập nhật trong phiên bản tiếp theo.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', backgroundColor: '#fff', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
            <ShieldAlert size={36} style={{ color: '#94a3b8', marginBottom: 8, margin: '0 auto' }} />
            <div style={{ fontWeight: 700, color: '#475569', fontSize: 14 }}>Không tìm thấy đơn hàng</div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Không có đơn đặt sân nào khớp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 80 }}>
            {filteredBookings.map((b: BookingItem, idx: number) => {
              const isPending = b.status === 'PENDING';
              const isConfirmed = b.status === 'CONFIRMED';

              // Map properties sang cấu trúc booking của BookingCard2
              const cardBooking = {
                id: b.id,
                customerName: b.bookerName || 'Khách vãng lai',
                courtName: b.courtName,
                startTime: b.startTime,
                endTime: b.endTime,
                bookingType: b.bookingType || 'DAILY',
                paymentStatus: isConfirmed ? 'PAID' : 'UNPAID', // Xác định tạm trạng thái thanh toán từ status của Booking
                isExpiringSoon: false // Có thể nâng cấp logic này sau nếu cần
              };

              return (
                <BookingCard2
                  key={b.id}
                  booking={cardBooking}
                  index={idx}
                  onConfirm={isPending ? (id) => handleUpdateStatus(id, 'CONFIRMED') : undefined}
                  isConfirming={updateStatusMutation.isPending}
                  onReject={
                    isPending 
                      ? (id) => handleUpdateStatus(id, 'CANCELLED') 
                      : isConfirmed 
                        ? (id) => handleUpdateStatus(id, 'CANCELLED') 
                        : undefined
                  }
                  isRejecting={updateStatusMutation.isPending}
                  rejectText={isConfirmed ? 'Hủy đơn' : 'Từ chối'}
                />
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
