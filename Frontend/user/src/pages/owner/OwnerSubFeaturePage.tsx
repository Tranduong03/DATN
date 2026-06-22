import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OwnerLayout from './OwnerLayout';
import { Plus, Trash2, ShoppingCart, RefreshCw, TrendingUp, Search, Layers } from 'lucide-react';
import { useOwnerBookings, useOwnerStats } from '../../hooks/queries/useBookingQueries';
import { 
  INITIAL_POS_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  INITIAL_VOUCHERS,
  INITIAL_MONTHLY_CONTRACTS
} from '../../mock/ownerMockData';
import type { 
  InventoryItem,
  Customer,
  Voucher,
  MonthlyBooking
} from '../../mock/ownerMockData';

export default function OwnerSubFeaturePage() {
  const location = useLocation();
  const path = location.pathname;

  // Determine current active section
  const isPos = path.startsWith('/owner/pos');
  const isInventory = path.startsWith('/owner/inventory');
  // const isService = path.startsWith('/owner/services');
  const isAnalytics = path.startsWith('/owner/analytics');
  const isCustomers = path.startsWith('/owner/customers');
  const isVouchers = path.startsWith('/owner/vouchers');
  const isMonthly = path.startsWith('/owner/monthly-bookings');

  // Page Title
  let pageTitle = "Chi tiết";
  if (isPos) pageTitle = "Bán hàng";
  else if (isInventory) pageTitle = "Kho & Dịch vụ";
  else if (isAnalytics) pageTitle = "Doanh thu & Lợi nhuận";
  else if (isCustomers) pageTitle = "Quản lý Khách hàng";
  else if (isVouchers) pageTitle = "Quản lý Voucher";
  else if (isMonthly) pageTitle = "Quản lý Đơn tháng";

  // --- 1. POS State ---
  const [posCart, setPosCart] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState('Sân 1');
  const [posProducts] = useState(INITIAL_POS_PRODUCTS);

  const addToCart = (product: any) => {
    const existing = posCart.find(item => item.id === product.id);
    if (existing) {
      setPosCart(posCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setPosCart([...posCart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setPosCart(posCart.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    if (posCart.length === 0) return;
    alert(`Thanh toán thành công hóa đơn cho ${selectedCourt}!\nTổng tiền: ${new Intl.NumberFormat('vi-VN').format(getCartTotal())} đ`);
    setPosCart([]);
  };

  const getCartTotal = () => {
    return posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // --- 2. Inventory State ---
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState(10);
  const [newItemCost, setNewItemCost] = useState(5000);
  const [newItemPrice, setNewItemPrice] = useState(10000);

  const handleRestock = (id: number) => {
    setInventoryList(inventoryList.map(item => item.id === id ? { ...item, stock: item.stock + 10 } : item));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setInventoryList([...inventoryList, {
      id: Date.now(),
      name: newItemName,
      stock: Number(newItemStock),
      cost: Number(newItemCost),
      price: Number(newItemPrice),
      alert: 5
    }]);
    setNewItemName('');
  };

  // --- 3. Analytics State (Mock) ---
  const { data: statsData } = useOwnerStats();
  const stats = statsData?.data || { todayBookings: 2, weeklyRevenue: 450000, newReviews: 1 };
  
  const { data: bookingsData } = useOwnerBookings();
  const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.data || [];
  const [customerSearch, setCustomerSearch] = useState('');
  
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  // Extract from real bookings to seed customers dynamically
  useEffect(() => {
    if (bookings.length > 0) {
      const uniqueBookers: Record<string, any> = {};
      bookings.forEach((b: any) => {
        if (b.bookerName) {
          if (!uniqueBookers[b.bookerName]) {
            uniqueBookers[b.bookerName] = {
              name: b.bookerName,
              phone: b.bookerPhone || '—',
              bookings: 0,
              spend: 0
            };
          }
          uniqueBookers[b.bookerName].bookings += 1;
          uniqueBookers[b.bookerName].spend += b.totalPrice || 0;
        }
      });
      
      const newCusts = Object.values(uniqueBookers).map((c: any, index) => {
        let tier = 'Đồng';
        if (c.bookings >= 15) tier = 'Kim cương';
        else if (c.bookings >= 10) tier = 'Vàng';
        else if (c.bookings >= 5) tier = 'Bạc';
        
        return {
          id: index + 10,
          name: c.name,
          phone: c.phone,
          bookings: c.bookings,
          spend: c.spend,
          tier
        };
      });
      
      if (newCusts.length > 0) {
        setCustomers(newCusts);
      }
    }
  }, [bookings]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.phone.includes(customerSearch)
  );

  // --- 5. Vouchers State ---
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newExpiry, setNewExpiry] = useState('31/07/2026');

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setVouchers([...vouchers, {
      id: Date.now(),
      code: newCode.toUpperCase().replace(/\s+/g, ''),
      discount: Number(newDiscount),
      maxUse: 100,
      used: 0,
      expiry: newExpiry,
      status: 'ACTIVE'
    }]);
    setNewCode('');
  };

  const handleToggleVoucher = (id: number) => {
    setVouchers(vouchers.map(v => v.id === id ? { ...v, status: v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : v));
  };

  // --- 6. Monthly Contracts State ---
  const [monthlyBookings, setMonthlyBookings] = useState<MonthlyBooking[]>(INITIAL_MONTHLY_CONTRACTS);
  const [mName, setMName] = useState('');
  const [mCourt, setMCourt] = useState('Sân 1');
  const [mSchedule, setMSchedule] = useState('T3, T5 (17:00 - 19:00)');
  const [mPrice, setMPrice] = useState(1200000);

  const handleAddMonthly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) return;
    setMonthlyBookings([...monthlyBookings, {
      id: Date.now(),
      name: mName,
      phone: '0988 888 888',
      court: mCourt,
      schedule: mSchedule,
      duration: '01/06 - 30/06/2026',
      price: Number(mPrice),
      status: 'Chờ thanh toán'
    }]);
    setMName('');
  };

  return (
    <OwnerLayout title={pageTitle} showSystemHeader={true}>
      <div className="owner-feature-wrapper" style={{ padding: '16px', background: '#f8fafc', minHeight: 'calc(100vh - 139px)' }}>
        
        {/* --- 1. POS VIEW --- */}
        {isPos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Selection */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Ghi nhận cho Sân con:</label>
              <select 
                value={selectedCourt} 
                onChange={e => setSelectedCourt(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', fontWeight: 600 }}
              >
                <option value="Sân 1">Sân 1 (Đang trống)</option>
                <option value="Sân 2">Sân 2 (Đang chơi)</option>
                <option value="Sân 3">Sân 3 (Đang trống)</option>
                <option value="Sân 4">Sân 4 (Đang chơi)</option>
              </select>
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {/* Product Shelf */}
              <div className="admin-section" style={{ padding: 16, margin: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
                  <Layers size={18} color="#f59e0b" /> Danh mục sản phẩm
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {posProducts.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{p.category} • Tồn kho: {p.stock}</div>
                      </div>
                      <button 
                        onClick={() => addToCart(p)}
                        style={{ padding: '6px 12px', background: '#047857', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Plus size={14} /> Thêm
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping Cart */}
              <div className="admin-section" style={{ padding: 16, margin: 0, backgroundColor: '#fff', border: '2px solid #047857' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6, color: '#064e3b' }}>
                  <ShoppingCart size={18} /> Giỏ hàng hiện tại
                </h3>
                
                {posCart.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    Chưa có sản phẩm nào. Chọn sản phẩm từ danh mục phía trên.
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                      {posCart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              {new Intl.NumberFormat('vi-VN').format(item.price)} đ x {item.quantity}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                              {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)} đ
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f1f5f9', paddingTop: 12, marginBottom: 16 }}>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Tổng hóa đơn:</span>
                      <span style={{ fontSize: 18, fontWeight: 850, color: '#ef4444' }}>
                        {new Intl.NumberFormat('vi-VN').format(getCartTotal())} đ
                      </span>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      style={{ width: '100%', padding: '12px 0', background: '#047857', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Thanh toán hóa đơn
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 2. INVENTORY VIEW --- */}
        {isInventory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Add product */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Nhập kho nhanh sản phẩm</h3>
              <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input 
                  type="text" 
                  placeholder="Tên sản phẩm (VD: Hộp bóng Tennis)"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, outline: 'none', fontSize: 13 }}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Số lượng</label>
                    <input type="number" value={newItemStock} onChange={e => setNewItemStock(Number(e.target.value))} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Giá vốn</label>
                    <input type="number" value={newItemCost} onChange={e => setNewItemCost(Number(e.target.value))} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Giá bán</label>
                    <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(Number(e.target.value))} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
                  </div>
                </div>
                <button type="submit" style={{ padding: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  + Thêm vào kho hàng
                </button>
              </form>
            </div>

            {/* List */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Danh sách kho hàng</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {inventoryList.map(item => {
                  const isLow = item.stock <= item.alert;
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid #e2e8f0', borderRadius: 12, backgroundColor: isLow ? '#fef2f2' : '#fff' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                          Vốn: {new Intl.NumberFormat('vi-VN').format(item.cost)} đ • Bán: {new Intl.NumberFormat('vi-VN').format(item.price)} đ
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: isLow ? '#ef4444' : '#0f172a' }}>{item.stock} cái</div>
                          {isLow && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>Sắp hết hàng!</span>}
                        </div>
                        <button 
                          onClick={() => handleRestock(item.id)}
                          title="Nhập thêm +10 cái"
                          style={{ padding: 8, background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <RefreshCw size={14} color="#475569" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- 3. ANALYTICS VIEW --- */}
        {isAnalytics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Doanh thu (Tuần)</span>
                <div style={{ fontSize: 20, fontWeight: 850, color: '#047857', marginTop: 4 }}>
                  {new Intl.NumberFormat('vi-VN').format(stats.weeklyRevenue)} đ
                </div>
              </div>
              <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Số đơn đặt sân</span>
                <div style={{ fontSize: 20, fontWeight: 850, color: '#6366f1', marginTop: 4 }}>
                  {stats.todayBookings} đơn
                </div>
              </div>
            </div>

            {/* Chart Card */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
                <TrendingUp size={18} color="#047857" /> Xu hướng doanh thu 7 ngày qua
              </h3>
              
              {/* SVG Line Chart */}
              <div style={{ height: 160, width: '100%', marginTop: 20, position: 'relative' }}>
                <svg viewBox="0 0 300 120" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#047857" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#047857" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="10" y1="20" x2="290" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="10" y1="60" x2="290" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="10" y1="100" x2="290" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                  
                  {/* Path Area */}
                  <path d="M10,95 L56,80 L102,85 L148,55 L194,70 L240,40 L286,25 L286,100 L10,100 Z" fill="url(#chart-grad)" />
                  
                  {/* Path Line */}
                  <path d="M10,95 L56,80 L102,85 L148,55 L194,70 L240,40 L286,25" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Circles */}
                  <circle cx="10" cy="95" r="4" fill="#ffffff" stroke="#047857" strokeWidth="2" />
                  <circle cx="56" cy="80" r="4" fill="#ffffff" stroke="#047857" strokeWidth="2" />
                  <circle cx="102" cy="85" r="4" fill="#ffffff" stroke="#047857" strokeWidth="2" />
                  <circle cx="148" cy="55" r="4" fill="#ffffff" stroke="#047857" strokeWidth="2" />
                  <circle cx="194" cy="70" r="4" fill="#ffffff" stroke="#047857" strokeWidth="2" />
                  <circle cx="240" cy="40" r="4" fill="#ffffff" stroke="#047857" strokeWidth="2" />
                  <circle cx="286" cy="25" r="4" fill="#ffffff" stroke="#047857" strokeWidth="2" />
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', fontSize: 10, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                  <span>CN</span>
                </div>
              </div>
            </div>

            {/* Details statistics */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a' }}>Hiệu suất sân bóng</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569', fontSize: 13 }}>Giờ cao điểm:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>17:00 - 20:00 hàng ngày</span>
                </div>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569', fontSize: 13 }}>Tỉ lệ lấp đầy sân:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>78%</span>
                </div>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569', fontSize: 13 }}>Lợi nhuận bán dịch vụ nước:</span>
                  <span style={{ fontWeight: 700, color: '#047857', fontSize: 13 }}>+ 345,000 đ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. CUSTOMERS VIEW --- */}
        {isCustomers && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
              <input 
                type="text" 
                placeholder="Tìm khách hàng theo tên, số điện thoại..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: 13 }}
              />
            </div>

            {/* List */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Danh sách hội viên</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredCustomers.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 12, backgroundColor: '#fff' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{c.name}</span>
                        <span style={{ 
                          fontSize: 9, 
                          fontWeight: 800, 
                          padding: '2px 6px', 
                          borderRadius: 6, 
                          backgroundColor: c.tier === 'Kim cương' ? '#fae8ff' : c.tier === 'Vàng' ? '#fef3c7' : c.tier === 'Bạc' ? '#f1f5f9' : '#fff3f3',
                          color: c.tier === 'Kim cương' ? '#a21caf' : c.tier === 'Vàng' ? '#b45309' : c.tier === 'Bạc' ? '#475569' : '#dc2626'
                        }}>{c.tier}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>SĐT: {c.phone}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#047857' }}>{c.bookings} lượt đặt</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{new Intl.NumberFormat('vi-VN').format(c.spend)} đ</div>
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy khách hàng nào.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- 5. VOUCHERS VIEW --- */}
        {isVouchers && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Create form */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Tạo mã Voucher giảm giá</h3>
              <form onSubmit={handleCreateVoucher} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input 
                  type="text" 
                  placeholder="Mã voucher (VD: PICKLE10)"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, textTransform: 'uppercase', outline: 'none', fontSize: 13 }}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>% Giảm giá</label>
                    <input type="number" value={newDiscount} onChange={e => setNewDiscount(Number(e.target.value))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Hạn dùng</label>
                    <input type="text" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                  </div>
                </div>
                <button type="submit" style={{ padding: '10px', background: '#047857', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Kích hoạt Voucher mới
                </button>
              </form>
            </div>

            {/* List */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Voucher sân thể thao của bạn</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {vouchers.map(v => {
                  const isExpired = v.status === 'EXPIRED';
                  const isActive = v.status === 'ACTIVE';
                  return (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 12, backgroundColor: isExpired ? '#f8fafc' : '#fff' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, color: isExpired ? '#94a3b8' : '#0f172a', letterSpacing: 0.5 }}>{v.code}</span>
                          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>-{v.discount}%</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                          Đã dùng: {v.used}/{v.maxUse} lượt • Hạn: {v.expiry}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleVoucher(v.id)}
                        disabled={isExpired}
                        style={{ 
                          padding: '6px 12px', 
                          background: isExpired ? '#e2e8f0' : isActive ? '#ecfdf5' : '#fee2e2',
                          color: isExpired ? '#94a3b8' : isActive ? '#059669' : '#dc2626',
                          border: 'none', 
                          borderRadius: 8, 
                          fontSize: 11, 
                          fontWeight: 700, 
                          cursor: isExpired ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isExpired ? 'Hết hạn' : isActive ? 'Bật' : 'Tắt'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- 6. MONTHLY BOOKINGS VIEW --- */}
        {isMonthly && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Create contract form */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Tạo hợp đồng Đơn tháng cố định</h3>
              <form onSubmit={handleAddMonthly} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input 
                  type="text" 
                  placeholder="Tên CLB hoặc Người đại diện"
                  value={mName}
                  onChange={e => setMName(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', fontSize: 13 }}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select 
                    value={mCourt} 
                    onChange={e => setMCourt(e.target.value)}
                    style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, background: 'white' }}
                  >
                    <option value="Sân 1">Sân 1</option>
                    <option value="Sân 2">Sân 2</option>
                    <option value="Sân 3">Sân 3</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Số tiền tháng (đ)"
                    value={mPrice} 
                    onChange={e => setMPrice(Number(e.target.value))}
                    style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Thời gian (VD: Thứ 2, 4, 6 từ 18:00 - 20:00)"
                  value={mSchedule}
                  onChange={e => setMSchedule(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', fontSize: 13 }}
                  required
                />
                <button type="submit" style={{ padding: '10px', background: '#047857', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  + Kích hoạt Lịch tháng cố định
                </button>
              </form>
            </div>

            {/* List */}
            <div className="admin-section" style={{ padding: 16, margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Hợp đồng đơn tháng hiện tại</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {monthlyBookings.map(mb => {
                  const isPaid = mb.status === 'Đã thanh toán';
                  return (
                    <div key={mb.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '1px solid #e2e8f0', borderRadius: 12, backgroundColor: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{mb.name}</div>
                          <span style={{ fontSize: 11, color: '#64748b' }}>Hạn: {mb.duration}</span>
                        </div>
                        <span style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          padding: '3px 8px', 
                          borderRadius: 6, 
                          backgroundColor: isPaid ? '#ecfdf5' : '#fffbeb',
                          color: isPaid ? '#059669' : '#d97706'
                        }}>{mb.status}</span>
                      </div>
                      
                      <div style={{ fontSize: 12, color: '#334155', borderTop: '1px dashed #f1f5f9', paddingTop: 8 }}>
                        <strong>{mb.court}</strong> • {mb.schedule}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Học phí/Chi phí cố định:</span>
                        <span style={{ fontWeight: 800, color: '#ef4444', fontSize: 13 }}>
                          {new Intl.NumberFormat('vi-VN').format(mb.price)} đ/tháng
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </OwnerLayout>
  );
}
