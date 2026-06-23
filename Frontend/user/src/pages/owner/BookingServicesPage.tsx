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

export default function OwnerBookingServicesPage() {
  const { data: bookingsData, isLoading } = useOwnerBookings();
  const updateStatusMutation = useUpdateBookingStatus();
  
  const [search, setSearch] = useState('');
  const [approvalTab, setApprovalTab] = useState<'BOOKING' | 'SERVICE' | 'MEMBER_CARD' | 'SERVICE_ORDER'>('BOOKING');
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

  // Chỉ lấy các đơn có trạng thái PENDING
  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING');
  const pendingCount = pendingBookings.length;

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ bookingId: id, status });
  };

  const filteredBookings = pendingBookings.filter((b: BookingItem) => {
    const matchSearch = (b.bookerName || '').toLowerCase().includes(search.toLowerCase()) || 
                        (b.bookerPhone || '').includes(search) ||
                        (b.id || '').includes(search) ||
                        (b.orderNumber?.toString() || '').includes(search);
    return matchSearch;
  });

  // Thực hiện sắp xếp các đơn cần duyệt
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
    <OwnerLayout title="Dịch vụ" showSystemHeader={true}>
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

          {/* Render tabs duyệt đơn */}
          <div className="owner-venue-tabs-bar">
            {[
              { label: `Đơn cần duyệt (${pendingCount})`, value: 'BOOKING' },
              { label: 'Dịch vụ cần duyệt (0)', value: 'SERVICE' },
              { label: 'Thẻ hội viên cần (0)', value: 'MEMBER_CARD' },
              { label: 'Duyệt đơn dịch vụ (0)', value: 'SERVICE_ORDER' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setApprovalTab(tab.value as any)}
                className={`owner-venue-tab ${approvalTab === tab.value ? 'active' : ''}`}
              >
                {tab.label}
                {approvalTab === tab.value && (
                  <TabUnderline 
                    layoutId="ownerServicesTabUnderline" 
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

        {/* List Content */}
        {isLoading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="owner-loading-text">Đang tải danh sách...</p>
          </div>
        ) : approvalTab !== 'BOOKING' ? (
          <div className="owner-empty-placeholder">
            <div className="owner-empty-title">Tính năng đang phát triển</div>
            <p className="owner-empty-desc">Tính năng duyệt này sẽ được cập nhật trong phiên bản tiếp theo.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="owner-empty-placeholder">
            <div className="owner-empty-title">Không tìm thấy đơn hàng cần duyệt</div>
            <p className="owner-empty-desc">Không có đơn đặt sân nào đang chờ duyệt.</p>
          </div>
        ) : (
          <div className="owner-cards-list">
            {sortedBookings.map((b: BookingItem, idx: number) => {
              const cardBooking = {
                id: b.id,
                customerName: b.bookerName || 'Khách vãng lai',
                courtName: b.courtName,
                startTime: b.startTime,
                endTime: b.endTime,
                bookingType: b.bookingType || 'DAILY',
                paymentStatus: 'UNPAID',
                isExpiringSoon: false,
                orderNumber: b.orderNumber,
                status: b.status
              };

              return (
                <BookingCard2
                  key={b.id}
                  booking={cardBooking}
                  index={idx}
                  onConfirm={(id) => handleUpdateStatus(id, 'CONFIRMED')}
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
