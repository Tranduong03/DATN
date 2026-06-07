# SportConnect — Hướng dẫn Mã Nguồn Frontend (User PWA & Admin Next.js)

Tài liệu này giải thích chi tiết cấu trúc thư mục, các tuyến đường (routes), cách cấu hình API và logic cốt lõi cho hai phân hệ độc lập ở Frontend.

---

## 1. Tổng Quan Cấu Trúc Hai Dự Án

Frontend được chia thành hai dự án riêng biệt chạy song song:
1. **`Frontend/user` (React 19 + Vite)**: Ứng dụng PWA (Progressive Web App) dành cho Người chơi (Default) và Chủ sân (Owner).
2. **`Frontend/admin` (Next.js 15 App Router)**: Cổng quản trị hệ thống dành cho Quản trị viên (Admin).

---

## 2. Phân Hệ 1: User & Owner PWA (`Frontend/user`)

Dự án này tối ưu hóa định dạng hiển thị cho các thiết bị di động (Mobile-first).

### 2.1. Bản đồ Thư mục `Frontend/user/src/`
```text
Frontend/user/src/
├── main.tsx                ← Điểm khởi động ứng dụng React, bọc Providers và Preloader
├── App.tsx                 ← Bộ định lý định tuyến chính (React Router v7)
├── index.css               ← CSS cốt lõi cho PWA di động (38KB)
├── i18n.ts                 ← Cấu hình đa ngôn ngữ (Tiếng Việt / English)
├── api/                    ← Axios HTTP Client chung (axiosClient.ts)
├── services/               ← Hàm gọi API (tầng Service thô)
├── hooks/                  ← React Query hooks (Queries + Mutations)
├── components/             ← Các React Components dùng chung (Layout, Common, Auth)
├── pages/                  ← Giao diện các trang nghiệp vụ chính
└── assets/                 ← Fonts local, icons, cờ quốc gia, splash preloader
```

### 2.2. Điểm Định Tuyến & Route Guards (`App.tsx`)
Tất cả trang đều sử dụng cơ chế Dynamic Imports (`React.lazy()`) để nạp tài nguyên theo nhu cầu truy cập thực tế.

| Loại Route | Guard Sử Dụng | Trang áp dụng | Cơ chế kiểm tra |
| :--- | :--- | :--- | :--- |
| **Công khai (Public)** | Không | `/`, `/map`, `/explore`, `/venue/:id`, `/matches`, `/login`, `/register` | Tự do truy cập |
| **Thành viên (Member)** | `AuthGuard` | `/me`, `/UserProfile`, `/settings`, `/reservedBooking` | Kiểm tra JWT token tại `localStorage.token` |
| **Chủ sân (Owner)** | `OwnerGuard` | `/owner`, `/owner/venues`, `/owner/venues/:id`, `/owner/bookings` | Kiểm tra JWT token chứa role `Owner` |

### 2.3. Quản lý Lỗi PWA di động
- **`NotFoundPage.tsx`** (`src/pages/error/NotFoundPage.tsx`): 
  - Hiển thị khi người dùng truy cập các đường dẫn không khớp với cấu hình hệ thống (Wildcard Route `path="*"`).
  - Giao diện thiết kế theo màu xanh lá thương hiệu, hiển thị icon cảnh báo và nút *"Quay lại Trang chủ"* về `/`.

---

## 3. Phân Hệ 2: Admin Portal (`Frontend/admin`)

Dự án này phục vụ nghiệp vụ quản trị quy mô lớn trên máy tính (Desktop), tích hợp **Tailwind CSS** và **Shadcn UI** làm thư viện UI chính.

### 3.1. Bản đồ Thư mục `Frontend/admin/src/`
```text
Frontend/admin/src/
├── app/                    ← Thư mục App Router chính của Next.js
│   ├── (main)/dashboard/   ← Dashboard layout bảo vệ
│   │   ├── default/        ← Trang tổng quan thống kê hệ thống
│   │   ├── users/          ← Quản lý người dùng (Khóa/Mở khóa tài khoản)
│   │   ├── owner-requests/ ← Phê duyệt hồ sơ đăng ký đối tác (Owner)
│   │   ├── venues/         ← Xem danh sách cơ sở thể thao đang hoạt động
│   │   ├── sport-categories/ ← CRUD các danh mục môn thể thao
│   │   └── [...not-found]/ ← Catch-all 404 bên trong dashboard để giữ Sidebar/Header
│   ├── login/              ← Trang đăng nhập Admin
│   ├── layout.tsx          ← Root Layout chính
│   ├── not-found.tsx       ← Trang báo lỗi 404 ngoài phân hệ Dashboard
│   └── error.tsx           ← Client error boundary bắt lỗi runtime UI
├── components/             ← Thành phần UI thiết kế
│   ├── ui/                 ← Shadcn components (Breadcrumb, Table, Dialog, Button)
│   └── dashboard-breadcrumb.tsx ← Breadcrumb động phân tích đường dẫn tiếng Việt
└── services/               ← Hàm gọi API dành riêng cho quản trị viên
```

### 3.2. Breadcrumb Động (`DashboardBreadcrumb`)
- Nằm trong `app/(main)/dashboard/layout.tsx`.
- Lắng nghe sự thay đổi của đường dẫn bằng `usePathname()`.
- Ánh xạ các phân đoạn đường dẫn sang tiếng Việt thông qua biến cấu hình `pathMap` (ví dụ: `sport-categories` hiển thị thành *"Môn thể thao"*).

### 3.3. Xử lý Lỗi & Cảnh báo lỗi trong Admin
- **`app/not-found.tsx`**: Xử lý 404 ở mức ứng dụng ngoài dashboard (ví dụ: sai đường dẫn đăng nhập).
- **`app/(main)/dashboard/[...not-found]/page.tsx`**: Bắt lỗi 404 ở mức Dashboard. Khi admin nhập sai link con, hệ thống hiển thị trang lỗi lồng bên trong giao diện làm việc chính, không phá vỡ layout Sidebar/Header của admin, tích hợp nút *"Quay lại Tổng quan"* (`/dashboard/default`).
- **`app/error.tsx`**: Ngăn chặn lỗi runtime làm sập trắng màn hình ứng dụng Next.js. Hiển thị thông tin lỗi kèm nút *"Thử lại"* và *"Quay lại Dashboard"*.

---

## 4. Tầng Dịch Vụ API & React Query

- **Axios Clients**: 
  - `axiosClient.ts` trong User PWA tự động đính kèm token `localStorage.token`.
  - Admin Portal giao tiếp qua endpoints chuyên dụng `/api/admin/*`, đính kèm mã xác thực riêng trong `localStorage.adminToken`.
- **React Query Cache Invalidation**: 
  - Khi thực hiện các thay đổi dữ liệu (ví dụ: Phê duyệt đối tác thành công, khóa tài khoản vi phạm, thêm môn thể thao mới), hệ thống sẽ kích hoạt hàm `invalidateQueries` để cập nhật bộ nhớ cache, đồng bộ hóa lập tức giao diện người dùng mà không cần reload trang.
