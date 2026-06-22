import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OwnerLayout from './OwnerLayout';
import { useOwnerBookings } from '../../hooks/queries/useBookingQueries';
import { useUpdateBookingStatus } from '../../hooks/mutations/useBookingMutations';
import { Search, Calendar, Clock, Phone, ShieldAlert, Check, X, Ban } from 'lucide-react';

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
}

export default function OwnerBookingsPage() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status'); // e.g. 'PENDING'
  
  const { data: bookingsData, isLoading } = useOwnerBookings();
  const updateStatusMutation = useUpdateBookingStatus();
  
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Synchronize URL search params with active filter state
  useEffect(() => {
    if (statusParam === 'PENDING') {
      setFilterStatus('PENDING');
    } else {
      setFilterStatus('ALL');
    }
  }, [statusParam]);

  const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.data || [];

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

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

  const formatTimeRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

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

          {/* Quick status tabs (only show if not strictly filtering PENDING approvals) */}
          {!statusParam && (
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
            <p style={{ fontSize: 13, color: '#64748b' }}>Đang tải danh sách đơn đặt...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', backgroundColor: '#fff', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
            <ShieldAlert size={36} style={{ color: '#94a3b8', marginBottom: 8, margin: '0 auto' }} />
            <div style={{ fontWeight: 700, color: '#475569', fontSize: 14 }}>Không tìm thấy đơn hàng</div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Không có đơn đặt sân nào khớp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 80 }}>
            {filteredBookings.map((b: BookingItem) => {
              const isPending = b.status === 'PENDING';
              const isConfirmed = b.status === 'CONFIRMED';

              return (
                <div 
                  key={b.id} 
                  style={{ 
                    background: 'white', 
                    borderRadius: 16, 
                    border: '1px solid #e2e8f0', 
                    padding: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  {/* Card Header: Booker & Court Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{b.bookerName || 'Khách vãng lai'}</h4>
                      {b.bookerPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginTop: 3 }}>
                          <Phone size={11} />
                          <span>{b.bookerPhone}</span>
                        </div>
                      )}
                    </div>
                    
                    <span 
                      style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: 8,
                        backgroundColor: isConfirmed ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
                        color: isConfirmed ? '#059669' : isPending ? '#d97706' : '#dc2626',
                        textTransform: 'uppercase'
                      }}
                    >
                      {b.status === 'PENDING' ? 'Chờ duyệt' : b.status === 'CONFIRMED' ? 'Đã nhận' : 'Đã hủy'}
                    </span>
                  </div>

                  {/* Card Body: Slot time & Court name */}
                  <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                      <span style={{ color: '#047857' }}>{b.courtName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                      <Clock size={13} color="#6366f1" />
                      <span>{formatTimeRange(b.startTime, b.endTime)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                      <Calendar size={13} color="#6366f1" />
                      <span style={{ textTransform: 'capitalize' }}>{formatDate(b.startTime)}</span>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Tổng hóa đơn:</span>
                      <div style={{ fontSize: 15, fontWeight: 850, color: '#ef4444' }}>{formatPrice(b.totalPrice)}</div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isPending && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                            style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <X size={14} /> Từ chối
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                            style={{ padding: '8px 12px', background: '#047857', color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Check size={14} /> Duyệt đơn
                          </button>
                        </>
                      )}
                      
                      {isConfirmed && (
                        <button 
                          onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                          style={{ padding: '8px 12px', background: '#f1f5f9', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Ban size={13} /> Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
