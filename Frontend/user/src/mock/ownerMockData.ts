export interface PosProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  cost: number;
  price: number;
  alert: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  bookings: number;
  spend: number;
  tier: string;
}

export interface Voucher {
  id: number;
  code: string;
  discount: number;
  maxUse: number;
  used: number;
  expiry: string;
  status: string;
}

export interface MonthlyBooking {
  id: number;
  name: string;
  phone: string;
  court: string;
  schedule: string;
  duration: string;
  price: number;
  status: string;
}

export const INITIAL_POS_PRODUCTS: PosProduct[] = [
  { id: 1, name: 'Nước suối Aquafina', price: 10000, category: 'Đồ uống', stock: 45 },
  { id: 2, name: 'Nước tăng lực Sting', price: 15000, category: 'Đồ uống', stock: 30 },
  { id: 3, name: 'Nước bù khoáng Revive', price: 15000, category: 'Đồ uống', stock: 50 },
  { id: 4, name: 'Quả cầu lông (lẻ)', price: 25000, category: 'Phụ kiện', stock: 120 },
  { id: 5, name: 'Thuê vợt tập sự', price: 50000, category: 'Dịch vụ', stock: 10 },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Nước suối Aquafina', stock: 45, cost: 4000, price: 10000, alert: 15 },
  { id: 2, name: 'Nước tăng lực Sting', stock: 30, cost: 7000, price: 15000, alert: 10 },
  { id: 3, name: 'Nước bù khoáng Revive', stock: 8, cost: 7000, price: 15000, alert: 10 },
  { id: 4, name: 'Quả cầu lông Hải Yến', stock: 120, cost: 18000, price: 25000, alert: 20 },
  { id: 5, name: 'Vợt cầu lông Yonex Nano', stock: 4, cost: 800000, price: 1200000, alert: 5 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Trần Dương', phone: '0912345678', bookings: 18, spend: 3200000, tier: 'Vàng' },
  { id: 2, name: 'Nguyễn Văn Nam', phone: '0987654321', bookings: 12, spend: 1850000, tier: 'Bạc' },
  { id: 3, name: 'Phạm Minh Trí', phone: '0905554433', bookings: 5, spend: 750000, tier: 'Đồng' },
  { id: 4, name: 'Lê Hoàng Yến', phone: '0933445566', bookings: 24, spend: 4900000, tier: 'Kim cương' },
];

export const INITIAL_VOUCHERS: Voucher[] = [
  { id: 1, code: 'SANCHOISANG', discount: 15, maxUse: 50, used: 12, expiry: '30/06/2026', status: 'ACTIVE' },
  { id: 2, code: 'GIOVANG20', discount: 20, maxUse: 100, used: 45, expiry: '15/07/2026', status: 'ACTIVE' },
  { id: 3, code: 'CHUSANLE', discount: 10, maxUse: 30, used: 30, expiry: '01/05/2026', status: 'EXPIRED' },
];

export const INITIAL_MONTHLY_CONTRACTS: MonthlyBooking[] = [
  { id: 1, name: 'CLB Cầu Lông Đống Đa', phone: '0911223344', court: 'Sân 1', schedule: 'T2, T4, T6 (18:00 - 20:00)', duration: '01/06 - 31/08/2026', price: 2400000, status: 'Đã thanh toán' },
  { id: 2, name: 'Nhóm Nguyễn Minh', phone: '0944556677', court: 'Sân 2', schedule: 'T7, CN (08:00 - 10:00)', duration: '01/05 - 31/07/2026', price: 1600000, status: 'Chờ thanh toán' },
];
