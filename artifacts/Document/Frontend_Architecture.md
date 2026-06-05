# Kiến trúc & Cấu trúc Thư mục Frontend (SportConnect)

Dự án Frontend được phân chia độc lập thành hai phân hệ chuyên biệt để tối ưu hóa hiệu năng, bảo mật và trải nghiệm người dùng:
1. **User PWA (React 19 + Vite)**: Ứng dụng PWA dành cho người chơi và chủ sân (Owner).
2. **Admin Portal (Next.js 15 App Router)**: Trang quản trị hệ thống dành cho Quản trị viên (Admin).

---

## 1. Phân hệ 1: User & Owner PWA (`Frontend/user`)

Ứng dụng PWA di động được xây dựng trên nền tảng **React 19**, **TypeScript** và **Vite**, định hướng Mobile-first. Sử dụng **TanStack Query v5** và **Axios** để quản lý server state và truyền tải dữ liệu.

### Cấu trúc Thư mục `Frontend/user/src`
```text
src/
├── App.tsx                     # Định nghĩa bộ định tuyến chính (React Router v7) & wildcard catch-all route
├── index.css                   # Định nghĩa CSS toàn cục di động & biến màu (Montserrat, Inter woff2)
├── main.tsx                    # File khởi tạo React & các Providers (QueryClient, GoogleOAuth)
│
├── api/                        # Cấu hình Axios clients
│   └── axiosClient.ts          # Client gọi API chính, tự động đính kèm JWT token từ localStorage
│
├── components/                 # Các component dùng chung
│   ├── auth/                   # Form xác thực (LoginForm, RegisterForm)
│   ├── common/                 # Component chung (LoadingOverlay, Preloader, GlobalNotification)
│   └── layout/                 # Bố cục giao diện (MainLayout, BottomNavigation)
│
├── hooks/                      # Custom React Hooks quản lý dữ liệu
│   ├── queryKeys.ts            # Quản lý tập trung các khóa cache (React Query Keys)
│   ├── mutations/              # Chứa các hooks thay đổi dữ liệu (POST, PUT, DELETE)
│   └── queries/                # Chứa các hooks truy vấn dữ liệu (GET)
│
├── pages/                      # Các trang theo tuyến đường
│   ├── auth/                   # Giao diện Đăng nhập, Đăng ký, Quên mật khẩu
│   ├── error/                  # Giao diện báo lỗi
│   │   └── NotFoundPage.tsx    # Trang 404 tùy chỉnh trên di động (xanh lá cây, Montserrat, nút Trang chủ)
│   ├── home/                   # Giao diện chính (Trang chủ, Chi tiết sân, Kèo đấu, Bản đồ Google Maps)
│   ├── owner/                  # Giao diện Chủ sân (Đăng ký chủ sân, Doanh thu, Cấu hình sân)
│   └── profile/                # Giao diện cá nhân (Hồ sơ, Lịch sử đặt sân, Đổi mật khẩu)
│
└── services/                   # Lớp gọi API thô qua Axios
```

### Điểm nhấn Kỹ thuật của User PWA
- **Bảo vệ Định tuyến (Route Guards)**: `AuthGuard` và `OwnerGuard` kiểm soát truy cập dựa trên JWT token.
- **Trang báo lỗi 404 di động (`NotFoundPage.tsx`)**: Đăng ký catch-all wildcard (`Route path="*"`) hiển thị giao diện xanh lá đặc trưng, hướng dẫn người chơi quay lại trang chủ.
- **Bản đồ Google Maps JS SDK**: Tải động Script tại runtime giúp tối ưu tài nguyên, hỗ trợ ghim địa điểm và bộ lọc bán kính GPS.

---

## 2. Phân hệ 2: Admin Portal (`Frontend/admin`)

Cổng quản trị hệ thống được tách riêng, xây dựng bằng **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** và **Shadcn UI** phục vụ hiển thị màn hình lớn (Desktop).

### Cấu trúc Thư mục `Frontend/admin/src`
```text
src/
├── app/                        # Thư mục App Router chính của Next.js
│   ├── (main)/dashboard/       # Các trang quản trị thuộc Dashboard layout bảo vệ
│   │   ├── layout.tsx          # Bố cục Dashboard tích hợp Sidebar, Header và Breadcrumb động
│   │   ├── default/            # Trang tổng quan thống kê
│   │   ├── users/              # Quản lý người chơi (Khóa/Mở khóa tài khoản)
│   │   ├── owner-requests/     # Phê duyệt hồ sơ nâng cấp chủ sân
│   │   ├── venues/             # Quản lý cơ sở sân bãi
│   │   ├── sport-categories/   # CRUD danh mục các môn thể thao
│   │   └── [...not-found]/     # Catch-all báo lỗi 404 riêng cho khu vực dashboard
│   ├── login/                  # Trang đăng nhập của quản trị viên
│   ├── layout.tsx              # Root Layout toàn cục của Admin
│   ├── not-found.tsx           # Trang báo lỗi 404 của toàn trang Admin
│   └── error.tsx               # Error boundary bắt lỗi kết xuất runtime toàn hệ thống Admin
│
├── components/                 # Các UI Components của Shadcn
│   └── ui/                     # Breadcrumb, Button, Card, Dialog, Table...
│
└── services/                   # Các dịch vụ gọi API phục vụ Admin
```

### Điểm nhấn Kỹ thuật của Admin Portal
- **Thanh Breadcrumb động (`DashboardBreadcrumb`)**: Tự động phân tích đường dẫn (`usePathname`), chuyển đổi các phân đoạn tiếng Anh (ví dụ: `owner-requests` thành *"Yêu cầu Owner"*) hiển thị cấu trúc điều hướng trực quan trong Header.
- **Hệ thống Xử lý Lỗi (Admin Error Handling)**:
  - **`not-found.tsx`**: Trang 404 toàn cục bắt lỗi sai URL ngoài khu vực điều khiển, có giao diện đẹp và nút quay lại Dashboard.
  - **`[...not-found]/page.tsx`**: Trang bắt lỗi 404 nằm sâu trong Dashboard giúp giữ nguyên khung layout (Sidebar, Header) của hệ thống quản trị.
  - **`error.tsx`**: Client Component bắt các lỗi runtime kết xuất giao diện để hệ thống không bị crash trắng màn hình, cung cấp tính năng *"Thử lại"* (Reset boundary) và *"Quay lại Dashboard"*.

---

## 3. Kiến trúc Gọi API (Client-Server Data Flow)

Cả hai ứng dụng đều giao tiếp độc lập với Backend thông qua các endpoints RESTful API của dự án `.NET Core 9` chạy tại `http://localhost:5001`.
- Phân hệ **User PWA** sử dụng `axiosClient` lưu thông tin vào `localStorage.token`.
- Phân hệ **Admin Portal** sử dụng JWT riêng thông qua `localStorage.adminToken` gửi kèm header `Authorization: Bearer <token>` để thực thi các tác vụ đặc quyền quản trị.
