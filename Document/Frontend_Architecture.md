# Kiến trúc & Cấu trúc Thư mục Frontend (SportConnect)

Dự án Frontend được xây dựng dựa trên **React 19**, **TypeScript** và **Vite**. Kiến trúc thư mục tuân thủ theo mô hình chia tách theo chức năng (Feature-based/Layer-based), giúp dễ dàng bảo trì và mở rộng trong tương lai. Hệ thống quản lý state và fetching data được giao cho **TanStack Query (React Query)** kết hợp với **Axios**.

## Tổng quan sơ đồ thư mục (Thư mục `src`)

```text
src/
├── App.tsx                     # Entry point chứa định tuyến (Routing) chính của ứng dụng
├── index.css                   # File CSS toàn cục (Global CSS, biến màu, layout chung)
├── main.tsx                    # File bootstrap React (Chứa Providers: QueryClient, Auth, GoogleOAuth)
│
├── api/                        # Cấu hình Axios clients
│   ├── adminAxiosClient.ts     # Client riêng cho Admin (có thể đính kèm header/interceptors riêng)
│   └── axiosClient.ts          # Client chung cho App (tự động gắn JWT token vào headers)
│
├── assets/                     # Tài nguyên tĩnh (Images, Fonts, Icons)
│   ├── fonts/                  # Chứa font chữ (VD: Montserrat woff2) và file css import font
│   ├── icon/                   # Các icon/avatar dùng sẵn trong app
│   └── ...
│
├── components/                 # Các component có thể tái sử dụng (Reusable components)
│   ├── auth/                   # Components liên quan đến xác thực (VD: LoginForm, RegisterForm)
│   ├── common/                 # Components chung (LoadingOverlay, Button, Modal...)
│   └── layout/                 # Cấu trúc layout (MainLayout, BottomNavigation, PageTransition...)
│
├── hooks/                      # Custom React Hooks
│   ├── queryKeys.ts            # Nơi định nghĩa tập trung các keys cho TanStack Query
│   ├── mutations/              # Chứa các hooks thay đổi dữ liệu (POST, PUT, DELETE)
│   │   ├── useAdminMutations.ts
│   │   ├── useAuthMutations.ts
│   │   ├── useBookingMutations.ts
│   │   ├── useMatchMutations.ts
│   │   └── useOwnerMutations.ts
│   └── queries/                # Chứa các hooks lấy dữ liệu (GET)
│       ├── useAdminQueries.ts
│       ├── useBookingQueries.ts
│       ├── useMatchQueries.ts
│       ├── useOwnerQueries.ts
│       └── usePublicQueries.ts
│
├── pages/                      # Các trang (Pages) tương ứng với từng Route
│   ├── admin/                  # Giao diện cho Admin (Dashboard, Duyệt chủ sân, Quản lý user...)
│   ├── auth/                   # Giao diện Đăng nhập, Đăng ký, Quên mật khẩu
│   ├── home/                   # Giao diện chính (Khách hàng xem sân, tạo kèo, đặt lịch)
│   ├── owner/                  # Giao diện cho Chủ sân (Quản lý sân, Quản lý lịch đặt, Cấu hình sân)
│   └── profile/                # Giao diện cá nhân người dùng (Thông tin, Lịch sử đặt, Đổi mật khẩu)
│
└── services/                   # Lớp giao tiếp trực tiếp với Backend API (Gọi axios)
    ├── adminService.ts         # Gọi API phần Admin
    ├── authService.ts          # Gọi API phần Authentication
    ├── bookingService.ts       # Gọi API Đặt sân
    ├── matchService.ts         # Gọi API Kèo đấu
    ├── ownerService.ts         # Gọi API Chủ sân
    └── publicService.ts        # Gọi API Public (Không cần đăng nhập)
```

## Các mẫu thiết kế (Design Patterns) & Điểm nhấn

1. **Phân tách Layer (Layered Architecture):**
   - **UI Layer (Pages/Components):** Chỉ chịu trách nhiệm hiển thị giao diện và nhận tương tác từ người dùng.
   - **State Layer (Hooks/Queries/Mutations):** Dùng TanStack Query để quản lý vòng đời của dữ liệu bất đồng bộ (Loading, Success, Error). Tách biệt hoàn toàn việc fetch data khỏi UI.
   - **Service Layer (Services):** Chứa các logic gọi HTTP Request thuần túy bằng Axios.
   - **API Layer (API Client):** Cấu hình Interceptors (tự động gắn token `localStorage` vào `Authorization` header).

2. **Route Guarding & Routing:**
   - Sử dụng `react-router-dom`.
   - Có các component Guard (`AuthGuard`, `OwnerGuard`, `AdminGuard`) để bảo vệ các tuyến đường yêu cầu đặc quyền. Nếu không có quyền, người dùng sẽ tự động bị chuyển hướng.
   - Hoạt ảnh chuyển trang (Page Transition) sử dụng `framer-motion` được tích hợp vào trong Component `<AnimatedRoutes>`.

3. **Styling (Thiết kế giao diện):**
   - Định hướng Mobile-first (Tối ưu hóa hiển thị di động). 
   - Sử dụng CSS thuần với CSS Variables (trong `index.css`) để quản lý Theming (Màu sắc gốc, Font chữ).

4. **Quản lý khóa Query (Query Keys Management):**
   - File `queryKeys.ts` tập trung toàn bộ các định danh key (VD: `['venues', 'public']`). Điều này giúp tránh gõ sai key và dễ dàng `invalidateQueries` (làm mới dữ liệu) sau khi người dùng thực hiện cập nhật.
