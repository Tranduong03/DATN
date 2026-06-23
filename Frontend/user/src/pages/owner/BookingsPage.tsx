import { useState, useEffect } from 'react';
import OwnerLayout from './OwnerLayout';
import { useOwnerBookings } from '../../hooks/queries/useBookingQueries';
import { useUpdateBookingStatus } from '../../hooks/mutations/useBookingMutations';
import { Search } from 'lucide-react';
import BookingCard2 from '../../components/booking/BookingCard2';
import { TabUnderline } from '../../components/ui/AnimatedTabs';
import './owner.css';

const tabTransition = { type: 'tween', ease: 'easeOut', duration: 0.22 };

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
  bookingType?: string;
  orderNumber?: number;
}

export default function OwnerBookingsPage() {
  const { data: bookingsData, isLoading } = useOwnerBookings();
  const updateStatusMutation = useUpdateBookingStatus();
  
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'DATE' | 'CODE'>('DATE');
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.owner-sort-select-wrapper')) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.data || [];

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ bookingId: id, status });
  };

  const filteredBookings = bookings.filter((b: BookingItem) => {
    let matchStatus = true;
    if (filterStatus === 'DAILY') {
      matchStatus = (b.bookingType || 'DAILY').toUpperCase() === 'DAILY' && b.status === 'PENDING';
    } else if (filterStatus === 'FIXED') {
      matchStatus = (b.bookingType || '').toUpperCase() === 'FIXED';
    } else if (filterStatus === 'PENDING') {
      matchStatus = b.status === 'PENDING';
    } else if (filterStatus === 'CANCELLED') {
      matchStatus = b.status === 'CANCELLED';
    } else if (filterStatus === 'ALL') {
      matchStatus = true;
    }

    const matchSearch = (b.bookerName || '').toLowerCase().includes(search.toLowerCase()) || 
                        (b.bookerPhone || '').includes(search) ||
                        (b.id || '').includes(search) ||
                        (b.orderNumber?.toString() || '').includes(search);
    return matchStatus && matchSearch;
  });

  // Thực hiện sắp xếp
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'DATE') {
      const dateA = new Date(a.createdAt || a.startTime).getTime();
      const dateB = new Date(b.createdAt || b.startTime).getTime();
      return dateB - dateA; // Mới nhất lên đầu
    } else {
      const numA = a.orderNumber || 0;
      const numB = b.orderNumber || 0;
      return numB - numA; // Mã đơn giảm dần
    }
  });

  return (
    <OwnerLayout title="Lịch đặt sân" showSystemHeader={true}>
      <div className="owner-bookings-wrapper">
        
        {/* Search & Tabs */}
        <div className="owner-search-tabs-container">
          {/* Search bar & Sort Dropdown */}
          <div className="owner-search-sort-container">
            <div className="owner-search-bar-wrapper">
              <Search size={18} className="owner-search-icon" />
              <input 
                type="text" 
                placeholder="Tìm theo tên, Mã đơn..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="owner-search-input"
              />
            </div>
            
            <div className="owner-sort-wrapper">
              <span>Sắp xếp:</span>
              <div className="owner-sort-select-wrapper" onClick={() => setIsSortOpen(!isSortOpen)}>
                <span className="owner-sort-select-val">
                  {sortBy === 'DATE' ? 'Ngày đặt' : 'Mã đơn'}
                </span>
                <span className="owner-sort-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                {isSortOpen && (
                  <div className="owner-sort-dropdown-menu">
                    <div 
                      className={`owner-sort-dropdown-item ${sortBy === 'CODE' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortBy('CODE');
                        setIsSortOpen(false);
                      }}
                    >
                      Mã đơn
                    </div>
                    <div className="owner-sort-dropdown-divider" />
                    <div 
                      className={`owner-sort-dropdown-item ${sortBy === 'DATE' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortBy('DATE');
                        setIsSortOpen(false);
                      }}
                    >
                      Ngày đặt
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick status tabs */}
          <div className="owner-venue-tabs-bar">
            {[
              { label: 'Đơn ngày', value: 'DAILY' },
              { label: 'Đơn cố định', value: 'FIXED' },
              { label: 'Chờ duyệt', value: 'PENDING' },
              { label: 'Đơn hủy', value: 'CANCELLED' },
              { label: 'Tất cả', value: 'ALL' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`owner-venue-tab ${filterStatus === tab.value ? 'active' : ''}`}
              >
                {tab.label}
                {filterStatus === tab.value && (
                  <TabUnderline 
                    layoutId="ownerBookingsTabUnderline" 
                    color="#dee4d8" 
                    height="1.5px" 
                    left={0} 
                    right={0} 
                    transition={tabTransition} 
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Card List */}
        {isLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="owner-loading-text">Đang tải danh sách...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="owner-empty-placeholder">
            <div className="owner-empty-title">Không tìm thấy đơn đặt sân nào</div>
            <p className="owner-empty-desc">Không có đơn đặt sân nào khớp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="owner-cards-list">
            {sortedBookings.map((b: BookingItem, idx: number) => {
              const isPending = b.status === 'PENDING';
              const isConfirmed = b.status === 'CONFIRMED';

              const cardBooking = {
                id: b.id,
                customerName: b.bookerName || 'Khách vãng lai',
                courtName: b.courtName,
                startTime: b.startTime,
                endTime: b.endTime,
                bookingType: b.bookingType || 'DAILY',
                paymentStatus: isConfirmed ? 'PAID' : 'UNPAID',
                isExpiringSoon: false,
                orderNumber: b.orderNumber,
                status: b.status
              };

              return (
                <BookingCard2
                  key={b.id}
                  booking={cardBooking}
                  index={idx}
                  onConfirm={isPending ? (id) => handleUpdateStatus(id, 'CONFIRMED') : undefined}
                  isConfirming={updateStatusMutation.isPending}
                />
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
