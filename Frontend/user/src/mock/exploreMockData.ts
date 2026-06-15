export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'USER' | 'OWNER' | 'ADMIN';
  time: string;
  content: string;
  image?: string;
  category: 'General' | 'Tournament' | 'Class' | 'Promo';
  likes: number;
  liked: boolean;
  comments: Comment[];
}

export interface Tournament {
  id: string;
  title: string;
  venueName: string;
  startDate: string;
  endDate: string;
  prizePool: string;
  fee: string;
  maxTeams: number;
  registeredTeams: number;
  status: 'OPEN' | 'ONGOING' | 'CLOSED';
  image: string;
  registered: boolean;
}

export interface TrainingClass {
  id: string;
  title: string;
  coachName: string;
  coachAvatar: string;
  sportType: string;
  schedule: string;
  price: string;
  rating: number;
  duration: string;
  registered: boolean;
}

export interface Promo {
  id: string;
  code: string;
  discount: string;
  minSpend: string;
  description: string;
  expiry: string;
  venueName: string;
  copied: boolean;
}

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorName: 'Trần Nguyên Phi Dương',
    authorAvatar: '',
    authorRole: 'USER',
    time: '10 phút trước',
    content: '🏸 Cần tìm 2 đối giao lưu cầu lông tối nay lúc 19h - 21h tại Sân cầu lông Ngôi Sao. Trình độ trung bình, anh em thân thiện vui vẻ, chi phí chia đều sân. Có nước trà đá miễn phí! Ai tham gia cmt bên dưới nhé.',
    category: 'General',
    likes: 12,
    liked: false,
    comments: [
      { id: 'c-1', author: 'Lê Văn Nam', avatar: '', content: 'Cho mình xin một slot nhé bạn ơi, trình độ trung bình yếu.', time: '8 phút trước' },
      { id: 'c-2', author: 'Nguyễn Minh Tuấn', avatar: '', content: 'Còn slot không chủ thớt? Mình đi 2 người.', time: '5 phút trước' }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Sân Pickleball Demo Siêu VIP',
    authorAvatar: 'https://images.unsplash.com/photo-1545809074-59472b3f5ecc',
    authorRole: 'OWNER',
    time: '2 giờ trước',
    content: '🏆 Giải đấu "Pickleball Summer Open 2026" chính thức mở cổng đăng ký tại cơ sở của chúng tôi! Tổng giải thưởng lên tới 20.000.000đ cùng cúp vô địch mạ vàng danh giá. Cơ hội cọ sát với các vợt thủ hàng đầu. Đăng ký ngay trong tab Giải đấu bên trên!',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
    category: 'Tournament',
    likes: 45,
    liked: true,
    comments: []
  },
  {
    id: 'post-3',
    authorName: 'Sân Test Onboarding ABC',
    authorAvatar: '',
    authorRole: 'OWNER',
    time: '5 giờ trước',
    content: '🔥 KHUYẾN MÃI CỰC KHỦNG! Giảm giá ngay 15% tổng hóa đơn đặt sân cầu lông & pickleball trong khung giờ vàng 08:00 - 15:00 từ thứ 2 đến thứ 6. Copy ngay voucher "GOLDENHOUR" trong phần Khuyến mãi nhé cả nhà!',
    category: 'Promo',
    likes: 28,
    liked: false,
    comments: [
      { id: 'c-3', author: 'Hoàng Long', avatar: '', content: 'Quá đã, mai rủ hội văn phòng đi quất thôi.', time: '3 giờ trước' }
    ]
  },
  {
    id: 'post-4',
    authorName: 'HLV Nguyễn Tiến Minh',
    authorAvatar: '',
    authorRole: 'ADMIN',
    time: '1 ngày trước',
    content: '🏸 Khai giảng khóa học cầu lông Nâng cao Kỹ thuật di chuyển và Đập cầu tấn công. Lớp giới hạn 8 học viên để đảm bảo chất lượng giảng dạy. Hỗ trợ sửa form tay và tư duy chiến thuật đánh đôi cực hiệu quả.',
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff',
    category: 'Class',
    likes: 67,
    liked: false,
    comments: []
  }
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 't-1',
    title: 'Pickleball Summer Open 2026',
    venueName: 'Sân Pickleball Demo Siêu VIP',
    startDate: '15/06/2026',
    endDate: '18/06/2026',
    prizePool: '20.000.000 VNĐ',
    fee: '300.000 VNĐ / Cặp',
    maxTeams: 32,
    registeredTeams: 24,
    status: 'OPEN',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
    registered: false
  },
  {
    id: 't-2',
    title: 'Giải Vô địch Cầu lông Đơn nam Quận 9',
    venueName: 'Sân Cầu Lông Huỳnh An',
    startDate: '22/06/2026',
    endDate: '24/06/2026',
    prizePool: '10.000.000 VNĐ',
    fee: '150.000 VNĐ / Người',
    maxTeams: 64,
    registeredTeams: 64,
    status: 'CLOSED',
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff',
    registered: false
  },
  {
    id: 't-3',
    title: 'Giao lưu Tennis Trẻ TP.HCM',
    venueName: 'CLB Quần vợt Ngôi Sao',
    startDate: '05/07/2026',
    endDate: '07/07/2026',
    prizePool: 'Hiện vật & Cúp lưu niệm',
    fee: 'Miễn phí',
    maxTeams: 16,
    registeredTeams: 8,
    status: 'OPEN',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0',
    registered: false
  }
];

export const INITIAL_CLASSES: TrainingClass[] = [
  {
    id: 'cl-1',
    title: 'Khóa học Cầu lông Cơ bản & Nâng cao',
    coachName: 'HLV Nguyễn Tiến Minh',
    coachAvatar: '',
    sportType: 'Cầu lông',
    schedule: 'Tối Thứ 2 - 4 - 6 (18:00 - 20:00)',
    price: '1.200.000đ / tháng',
    rating: 4.9,
    duration: '12 buổi / khóa',
    registered: false
  },
  {
    id: 'cl-2',
    title: 'Lớp Nhập môn Pickleball siêu tốc',
    coachName: 'Coach Anna Trịnh',
    coachAvatar: '',
    sportType: 'Pickleball',
    schedule: 'Sáng Thứ 7 - CN (08:00 - 10:00)',
    price: '800.000đ / khóa',
    rating: 4.7,
    duration: '6 buổi / khóa',
    registered: false
  },
  {
    id: 'cl-3',
    title: 'Chiến thuật Tennis Đánh đôi Chuyên nghiệp',
    coachName: 'HLV Phạm Hoàng Nam',
    coachAvatar: '',
    sportType: 'Quần vợt',
    schedule: 'Chiều Thứ 3 - 5 (16:00 - 18:00)',
    price: '1.800.000đ / tháng',
    rating: 4.8,
    duration: '8 buổi / khóa',
    registered: false
  }
];

export const INITIAL_PROMOS: Promo[] = [
  {
    id: 'p-1',
    code: 'GOLDENHOUR',
    discount: '15%',
    minSpend: 'Không giới hạn',
    description: 'Giảm giá đặt sân trong khung giờ vàng 8:00 - 15:00 từ Thứ 2 đến Thứ 6.',
    expiry: '15/06/2026',
    venueName: 'Sân Test Onboarding ABC',
    copied: false
  },
  {
    id: 'p-2',
    code: 'NEWBIEPLAY',
    discount: '50.000 VNĐ',
    minSpend: 'Hóa đơn từ 200.000 VNĐ',
    description: 'Mã giảm giá cho khách đặt sân lần đầu tiên trên hệ thống SportConnect.',
    expiry: '30/06/2026',
    venueName: 'Tất cả các cơ sở',
    copied: false
  },
  {
    id: 'p-3',
    code: 'PICKLEBEST',
    discount: '20%',
    minSpend: 'Hóa đơn đặt sân Pickleball',
    description: 'Mã ưu đãi đặc quyền cho các tín đồ đam mê môn Pickleball cực HOT.',
    expiry: '10/06/2026',
    venueName: 'Sân Pickleball Demo Siêu VIP',
    copied: false
  }
];
