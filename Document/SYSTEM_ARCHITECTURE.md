# Tài Liệu Đặc Tả Hệ Thống SportConnect (System Architecture & Documentation)

> **Mục đích:** Tài liệu này đóng vai trò là "bản đồ" tổng quan nhất cho toàn bộ hệ thống SportConnect. Nó được thiết kế để bất kỳ thành viên mới nào trong team, hoặc một AI Agent, khi đọc vào đều có thể hiểu ngay lập tức ý tưởng, kiến trúc, công nghệ và các luồng nghiệp vụ (Business Flows) đang chạy trong hệ thống.

---

## 1. Ý tưởng cốt lõi (Core Concept)
**SportConnect** là một nền tảng Web Application (định hướng PWA) kết nối những người đam mê thể thao với các chủ sân thể thao. 
- **Người dùng phổ thông (Default):** Có thể tìm kiếm sân, đặt lịch, và tham gia các hoạt động thể thao.
- **Chủ sân (Owner):** Có thể đăng ký đưa sân của mình lên hệ thống, quản lý lịch đặt, doanh thu.
- **Quản trị viên (Admin):** Giám sát toàn bộ hoạt động, quản lý tài khoản, và đặc biệt là phê duyệt/từ chối các đơn xin trở thành Chủ sân.

---

## 2. Kiến trúc Backend (ASP.NET Core - Clean Architecture)

Backend được xây dựng bằng **C# & ASP.NET Core 8 Web API**, sử dụng **Entity Framework Core** và cơ sở dữ liệu **SQL Server**. Hệ thống tuân thủ chặt chẽ nguyên tắc **Clean Architecture** chia làm 4 layer:

### Các Layers:
1. **`SportConnect.Core` (Domain Layer):**
   - Chứa các Entities cốt lõi: `User`, `Venue`, `Role` (Admin, Owner, Staff, Default), và các Interfaces cơ bản.
   - Hoàn toàn độc lập, không phụ thuộc vào bất kỳ thư viện hay layer nào khác.
2. **`SportConnect.Application` (Use Case Layer):**
   - Chứa toàn bộ Business Logic của hệ thống.
   - Các Service Interfaces: `IAuthService`, `IEmailService`, `IAdminService`, `IOwnerService`.
   - Data Transfer Objects (DTOs) dùng để hứng dữ liệu từ Controller và trả về cho Frontend.
3. **`SportConnect.Infrastructure` (Infrastructure Layer):**
   - Nơi giao tiếp với thế giới bên ngoài: Cấu hình `DbContext`, thực thi các Repositories truy xuất SQL Server.
   - Tích hợp dịch vụ bên thứ ba: `EmailService` sử dụng SMTP (Gmail) để gửi email quên mật khẩu.
4. **`SportConnect.API` (Presentation Layer):**
   - Chứa các RESTful Controllers tiếp nhận request từ Client.
   - Chứa `GlobalExceptionMiddleware` để bắt mọi lỗi và trả về JSON chuẩn hóa (thay vì trang HTML lỗi).
   - Cấu hình CORS policy, JWT Authentication & Dependency Injection trong `Program.cs`.

### Các tính năng Backend nổi bật:
- Mã hóa mật khẩu bảo mật bằng **BCrypt**.
- Xác thực và phân quyền bằng **JWT Token** (Role-based Authorization).
- **Seeder:** Tự động tạo tài khoản Admin mặc định khi chạy database lần đầu.

---

## 3. Kiến trúc Frontend (React 19 + Vite)

Frontend là một **Single Page Application (SPA)** hiện đại, nhấn mạnh vào trải nghiệm người dùng (UX) nhanh, mượt và thiết kế UI mang phong cách Premium, năng động (Glassmorphism, Vibrant colors).

### Công nghệ lõi:
- **Framework:** React 19, TypeScript, build bằng Vite.
- **Routing:** React Router v7.
- **State & Data Fetching:** **TanStack Query v5** kết hợp **Axios**.
- **CSS:** Vanilla CSS với tư duy Design System Tokens tập trung (không dùng Tailwind).

### Cấu trúc thư mục chuẩn Best Practices:
- **`src/api/axiosClient.ts`**: Cấu hình Axios trung tâm. Tự động đính kèm `Authorization: Bearer <token>` vào request và xử lý logic response chung.
- **`src/hooks/`**:
  - `queryKeys.ts`: Quản lý tập trung mọi Query Keys dưới dạng object constants để tránh sai sót chính tả khi Invalidate Cache.
  - `queries/` & `mutations/`: Custom hooks sử dụng TanStack Query (ví dụ: `useAdminUsers`, `useApproveOwnerRequest`). Gánh vác toàn bộ việc gọi API, quản lý `isLoading`, caching, tách bạch hoàn toàn khỏi UI Components.
- **`src/services/`**: Chứa các hàm fetch raw (chỉ gọi `axiosClient`). Được chia module theo nghiệp vụ: `authService`, `adminService`, `ownerService`.
- **`src/pages/`**: Nơi chứa giao diện phân trang (Auth, Admin, Owner, Profile).

---

## 4. Các Luồng Nghiệp Vụ Chính (Business Flows đã hoàn thiện)

### A. Luồng Xác thực (Authentication Flow)
- **Đăng ký / Đăng nhập:** Hệ thống xử lý linh hoạt (cho phép đăng ký bằng Email HOẶC Số điện thoại), quản lý phiên bằng JWT Token lưu ở Client. Hỗ trợ đăng nhập qua Google (`@react-oauth/google`).
- **Bảo mật Tài khoản:** Cung cấp tính năng "Quên mật khẩu" (gửi email OTP/Link qua SMTP) và "Đổi mật khẩu" (xác thực mật khẩu cũ bằng BCrypt).

### B. Luồng Onboarding Chủ Sân (Owner Flow)
Là một luồng Multi-step form phức tạp (`OwnerOnboardingFlow.tsx`) cho phép User bình thường nâng cấp thành Owner:
- Hệ thống chia thành nhiều bước (thông tin cá nhân, thông tin sân, ảnh sân).
- Có tính năng **Save Draft**: Dữ liệu đang nhập dở sẽ được lưu xuống Backend và phục hồi lại khi User quay lại.
- Trạng thái duyệt (Pending, Verified, Rejected).

### C. Luồng Quản Trị (Admin Flow)
Bảng điều khiển dành cho Admin (`/admin`):
- **Admin Dashboard:** Thống kê tổng quan sử dụng `Promise.all` hoặc nhiều Query chạy song song.
- **Quản lý Users:** Bảng danh sách phân trang (Pagination), tìm kiếm (Search), hiển thị Trust Score, Status.
- **Quản lý Owner Requests:** Nơi Admin xem chi tiết thông tin đơn đăng ký chủ sân. Admin có thể thực hiện Mutation **Duyệt (Approve)** hoặc **Từ chối (Reject - kèm lý do)**. Sau khi thao tác, hệ thống tự động `invalidateQueries` để cập nhật lại UI ngay lập tức mà không cần reload.

### D. Luồng Cấu hình Sân (Venue Configuration)
Dành cho Owner sau khi được duyệt:
- **Quản lý Sân con (Courts):** Cho phép tự động khởi tạo danh sách sân mẫu dựa trên quy mô (Venue Scale) đã kê khai. Có cảnh báo khi tạo vượt quy mô.
- **Cấu hình Bảng giá (Price Rules):** Thiết lập giá theo khung giờ và ngày trong tuần. Backend tự động áp dụng logic ưu tiên: **Khung giờ cụ thể/ngắn sẽ ghi đè khung giờ chung (All day)**, đảm bảo tính toán giá chính xác.

### E. Luồng Đặt Sân (Booking Flow)
Dành cho người dùng (Default User):
- **Trải nghiệm chọn sân:** Hỗ trợ chọn và đặt **nhiều block trên nhiều sân khác nhau cùng lúc** (Multi-court Booking). Giao diện trực quan cho phép kéo chọn/click chọn linh hoạt.
- **Xử lý đồng thời (Concurrency):** Backend kiểm tra chồng lặp thời gian (overlap validation) chặt chẽ, ngăn chặn triệt để tình trạng double-booking.

### F. Luồng Bản Đồ Tìm Sân (Map Flow — Google Maps API)
Dành cho người dùng tìm sân thể thao gần vị trí hiện tại:
- **Google Maps JavaScript API:** Tải động script Google Maps tại runtime. API Key được cấu hình qua biến môi trường `VITE_GOOGLE_MAPS_API_KEY`.
- **GPS Định vị:** Truy cập HTML5 Geolocation API để xác định tọa độ người dùng. Nút GPS Locate cho phép pan camera về vị trí hiện tại.
- **Bộ lọc động (Dynamic Filters):** Danh sách môn thể thao được truy vấn từ API `/api/SportCategories` (cơ sở dữ liệu), hiển thị dưới dạng các filter pills có màu sắc và emoji tương ứng. Hỗ trợ lọc theo bán kính 1–10km.
- **Custom Markers:** Ghim teardrop SVG tùy chỉnh có mã màu theo môn thể thao, chứa emoji bên trong vòng tròn trắng.
- **Bottom Sheet Chi tiết:** Click vào marker hiển thị thẻ thông tin sân (tên, đánh giá, địa chỉ, giá, nút đặt sân).
- **Fullscreen Map Layout:** Map container sử dụng `position: fixed` để phủ toàn bộ viewport, cho phép bản đồ tràn vào phần bo tròn của thanh navigation.

### G. Luồng Bảng Tin Khám Phá (Explore / Social Feed Flow)
Không gian mạng xã hội thể thao dạng Facebook/Zalo:
- **Bảng tin (Feed Tab):** Cho phép đăng bài, lọc theo danh mục, like/comment tương tác.
- **Giải đấu (Tournaments Tab):** Hiển thị giải đấu sắp tới với phí, giải thưởng, timeline, nút đăng ký.
- **Lớp học (Classes Tab):** Quảng bá lớp huấn luyện với thông tin HLV, giá, lịch học.
- **Ưu đãi (Promotions Tab):** Mã coupon khuyến mãi từ các sân, hỗ trợ sao chép mã tự động.

---

## 5. Định hướng cho tương lai (Next Steps)
- ~~Tích hợp cổng thanh toán trực tuyến (VNPay / Momo) cho Booking.~~ ✅ Đã tích hợp VNPay.
- ~~Xây dựng tính năng "Tìm đối / Ghép đội" (Matchmaking).~~ ✅ Đã triển khai hệ thống Match/Kèo đấu.
- ~~Tích hợp bản đồ tìm sân (Google Maps API).~~ ✅ Đã hoàn thành.
- ~~Xây dựng bảng tin khám phá (Social Feed).~~ ✅ Đã hoàn thành.
- Cải thiện hệ thống Đánh giá (Review & Rating) cho các cơ sở.
- Nâng cấp Frontend thành Progressive Web App (PWA) đầy đủ để có thể cài đặt và gửi Push Notifications trên mobile.
- Tích hợp hệ thống thông báo realtime (SignalR / WebSocket).
- Tối ưu hóa SEO và hiệu năng tải trang.

> Tài liệu này được thiết kế như nguồn chân lý (Source of Truth). Bất kỳ khi nào dự án mở rộng, kiến trúc hoặc luồng dữ liệu thay đổi, tài liệu này cần được cập nhật tương ứng.
