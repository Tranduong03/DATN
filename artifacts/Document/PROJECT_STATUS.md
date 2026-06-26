# SportConnect - Báo Cáo Trạng Thái Dự Án (Project Status Report)

Tài liệu này tổng hợp toàn bộ các tính năng đã được xây dựng, cấu trúc thư mục thực tế, công nghệ áp dụng và trạng thái hoàn thành của dự án **SportConnect**.

---

## 1. Bản Đồ Tính Năng & Trạng Thái Hoàn Thành

### Phân Hệ 1: Xác Thực & Tài Khoản (Authentication & Profile)
| Tính Năng | Backend | Frontend User | Trạng Thái | Ghi Chú |
|---|---|---|---|---|
| Đăng ký / Đăng nhập (Email hoặc SĐT) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Mã hóa mật khẩu BCrypt |
| Đăng nhập bằng Google | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Sử dụng `@react-oauth/google` |
| Quên mật khẩu / Đổi mật khẩu | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Gửi OTP qua Email (SMTP) |
| Silent Refresh Token | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Tự động làm mới access token qua DB |
| Cập nhật Hồ sơ cá nhân | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Tích hợp chỉ số BMI, sở thích chơi |

### Phân Hệ 2: Tìm Kiếm & Bản Đồ (Map & Search)
| Tính Năng | Backend | Frontend User | Trạng Thái | Ghi Chú |
|---|---|---|---|---|
| Tải bản đồ động | - | ✅ Hoàn thành | Hoàn thành | Google Maps JavaScript API |
| Định vị GPS (Geolocation) | - | ✅ Hoàn thành | Hoàn thành | Lấy tọa độ GPS thiết bị |
| Bộ lọc động theo bán kính & thể thao | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Lọc 1-10km từ GPS |
| Ghim sân tùy chỉnh (Custom Markers) | - | ✅ Hoàn thành | Hoàn thành | Teardrop SVG chứa icon/emoji thể thao |
| Bottom Sheet chi tiết nhanh | - | ✅ Hoàn thành | Hoàn thành | Trượt xem thông tin sân & click đặt |

### Phân Hệ 3: Đặt Lịch & Thanh Tạo (Booking & Payment)
| Tính Năng | Backend | Frontend User | Trạng Thái | Ghi Chú |
|---|---|---|---|---|
| Chọn sân con & Khung giờ | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Hỗ trợ kéo chọn nhiều ô |
| Đặt lịch nhiều sân cùng lúc (Multi-court) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Đặt nhiều block giờ và nhiều sân con |
| Kiểm tra trùng lịch (Concurrency) | ✅ Hoàn thành | - | Hoàn thành | Chống double-booking |
| Tích hợp cổng thanh toán | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Đã kết nối thành công với **VNPay** |
| Nút hành động ở Lịch sử đặt sân | - | ✅ Hoàn thành | Hoàn thành | Tích hợp Thanh toán, Tạo kèo đấu, Đánh giá |

### Phân Hệ 4: Đội Nhóm & Đề Xuất (Teams & Recommendation)
| Tính Năng | Backend | Frontend User | Trạng Thái | Ghi Chú |
|---|---|---|---|---|
| Tạo & Quản lý đội nhóm | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Đội trưởng có quyền phê duyệt thành viên |
| Tìm kiếm và xin gia nhập đội | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Gửi request ở trạng thái PENDING |
| Đề xuất trận đấu / Đội nhóm AI | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Gợi ý dựa trên trình độ & BMI |

### Phân Hệ 5: Mạng Xã Hội Khám Phá (Explore Feed)
| Tính Năng | Backend | Frontend User | Trạng Thái | Ghi Chú |
|---|---|---|---|---|
| Bảng tin thể thao (Feed) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Đăng bài, lọc danh mục, like/comment |
| Giải đấu (Tournaments) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Đăng ký tham gia giải đấu |
| Lớp học thể thao (Classes) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Thông tin huấn luyện viên & lịch học |
| Khuyến mãi (Promotions) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Auto-copy mã giảm giá từ chủ sân |

### Phân Hệ 6: Dành Cho Chủ Sân (Owner Management)
| Tính Năng | Backend | Frontend User | Trạng Thái | Ghi Chú |
|---|---|---|---|---|
| Đăng ký Chủ sân (Onboarding Flow) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Form nhiều bước, hỗ trợ Save Draft, quản lý qua DB Transaction |
| Dashboard chủ sân (8 phân hệ) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | POS, Kho, Doanh thu, Vouchers, Đơn tháng... |
| Quản lý chi tiết sân (Tabbed interface) | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Tab thông tin, bảng giá, ảnh, đánh giá |
| Đồng bộ Tab Active lên URL | - | ✅ Hoàn thành | Hoàn thành | Đã đồng bộ qua URL query `?tab=...` |
| Cấu hình sân & bảng giá | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Override giá theo giờ/ngày |
| Tự động duyệt đơn hàng | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Auto-confirm đơn hàng < 30p hoặc quá giờ |
| Sắp xếp & lọc đơn hàng theo tab | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Tabs (Đơn ngày, Đơn cố định, Chờ duyệt, Đơn hủy, Tất cả) kèm sort |

### Phân Hệ 7: Quản Trị Hệ Thống (Admin Portal)
| Tính Năng | Backend | Frontend Admin | Trạng Thái | Ghi Chú |
|---|---|---|---|---|
| Dashboard thống kê tổng quan | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Next.js 15 App Router |
| Quản lý người dùng | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Danh sách phân trang, tìm kiếm, khóa/mở |
| Duyệt yêu cầu chủ sân | ✅ Hoàn thành | ✅ Hoàn thành | Hoàn thành | Xem chi tiết, duyệt/từ chối kèm lý do |
| Breadcrumb động tiếng Việt | - | ✅ Hoàn thành | Hoàn thành | Tự động định vị đường dẫn trên UI |

---

## 2. Thông Tin Đường Dẫn Router Hiện Tại (Frontend User)

*   **Trang chủ**: `/`
*   **Bản đồ tìm sân**: `/map`
*   **Bảng tin khám phá**: `/explore`
*   **Chi tiết sân (Khách xem)**: `/venue/:id`
*   **Đăng ký & Đăng nhập**: `/register`, `/login`
*   **Đặt sân**: `/UserBooking`
*   **Lịch sử đặt sân của tôi**: `/reservedBooking`
*   **Đội nhóm**: `/teams`, `/teams/:id`
*   **Thông báo cá nhân**: `/notifications`
*   **Onboarding chủ sân**: `/owner/onboarding`
*   **Dashboard chủ sân**: `/owner`
*   **Quản lý danh sách sân (Chủ sân)**: `/owner/venues`
*   **Chi tiết sân & Tab hoạt động (Chủ sân)**: `/owner/venues/:id` (Hỗ trợ `?tab=info/pricing/images/reviews/terms`)
*   **Cấu hình sân & bảng giá (Chủ sân)**: `/owner/venues/:id/edit` (Hỗ trợ `?tab=...`)

---

## 3. Công Nghệ Đang Chạy Thực Tế

### Backend (C# .NET 8 Web API)
*   **Mô hình**: Clean Architecture (API -> Application -> Infrastructure -> Core).
*   **Database Access**: Entity Framework Core với SQL Server.
*   **Bảo mật**: JWT (JSON Web Tokens) với thuật toán mã hóa khóa đối xứng, mật khẩu mã hóa BCrypt.
*   **Thanh toán**: Tích hợp SDK VNPay API.

### Frontend User PWA (ReactJS 19 + TypeScript + Vite)
*   **Quản lý trạng thái**: TanStack Query v5 (React Query) cho API caching, React Context cho Auth.
*   **Routing**: React Router v7.
*   **Styling**: Mobile-first, Vanilla CSS với hệ thống biến (Design Tokens).
*   **Hiệu ứng chuyển trang**: Framer Motion.

### Frontend Admin (Next.js 15 + Shadcn UI + Tailwind CSS)
*   **Kiến trúc**: App Router.
*   **UI Components**: Radix UI + Lucide React + Tailwind CSS.

---

## 4. Định Hướng Các Bước Tiếp Theo
1.  **Hoàn thiện PWA**: Cấu hình đầy đủ Service Worker để hỗ trợ chế độ ngoại tuyến (Offline caching) tốt hơn và cài đặt ứng dụng (Install prompt) trên Android/iOS.
2.  **Thông báo thời gian thực (Push Notifications)**: Sử dụng SignalR hoặc WebSockets để gửi thông báo tức thời cho người dùng khi có đặt sân mới hoặc có tin nhắn/kèo đấu mới.
3.  **Tối ưu SEO & Hiệu năng**: Cấu hình SSR cho các trang công cộng và tối ưu dung lượng ảnh tải lên Cloud.
