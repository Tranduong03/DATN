# SportConnect — Giải Thích Mã Nguồn Frontend (React PWA)

> Tài liệu này giải thích chi tiết từng file, từng thư mục trong mã nguồn Frontend để intern có thể đọc hiểu và phát triển tính năng mới.

---

## 1. Tổng Quan Cấu Trúc

```
Frontend/src/
├── main.tsx                ← Điểm khởi động ứng dụng
├── App.tsx                 ← Định tuyến (Routing) toàn bộ trang
├── index.css               ← CSS chung cho PWA (mobile-first, 38KB)
├── admin.css               ← CSS riêng cho Admin desktop (18KB)
├── i18n.ts                 ← Cấu hình đa ngôn ngữ (Tiếng Việt / English)
├── api/                    ← Axios HTTP clients
├── services/               ← Hàm gọi API (tầng service)
├── hooks/                  ← React Query hooks (queries + mutations)
├── components/             ← Components tái sử dụng
├── pages/                  ← Các trang UI chính
└── assets/                 ← Fonts, icons, ảnh, file ngôn ngữ
```

---

## 2. Điểm Khởi Động — `main.tsx`

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>    // React Query
      <GoogleOAuthProvider clientId={...}>         // Google Login
        <Preloader />                              // Splash screen
        <App />                                    // Ứng dụng chính
      </GoogleOAuthProvider>
      <ReactQueryDevtools />                       // Debug tool (chỉ dev)
    </QueryClientProvider>
  </StrictMode>
);
```

**QueryClient** được cấu hình: `staleTime: 5 phút` (dữ liệu cache 5 phút trước khi refetch), `refetchOnWindowFocus: false` (không refetch khi chuyển tab).

---

## 3. Routing — `App.tsx`

### 3.1. Lazy Loading

Tất cả page components đều được import động bằng `React.lazy()`:
```tsx
const HomePage = lazy(() => import('./pages/home/HomePage'));
```
Khi user truy cập một trang, Vite chỉ tải JS chunk của trang đó → **giảm bundle ban đầu**.

### 3.2. Route Guards — Bảo vệ đường dẫn

| Guard | Bảo vệ | Cơ chế |
|-------|--------|--------|
| `AuthGuard` | `/me`, `/profile`, `/settings`, `/owner/onboarding` | Kiểm tra `localStorage.token` tồn tại. Nếu không → redirect `/login`. |
| `OwnerGuard` | `/owner/*` | Kiểm tra JWT token chứa role `Owner`. Nếu không → redirect `/owner/onboarding`. |
| `AdminGuard` | `/admin/*` | Kiểm tra `localStorage.adminToken` tồn tại. Nếu không → redirect `/admin/login`. |

### 3.3. Bản đồ Route chính

| Route | Page Component | Mô tả |
|-------|---------------|-------|
| `/` | `HomePage` | Trang chủ PWA |
| `/map` | `MapPage` | Bản đồ Google Maps tìm sân |
| `/explore` | `ExplorePage` | Khám phá sân theo bộ lọc |
| `/venue/:id` | `VenueDetailPage` | Chi tiết sân + đặt lịch |
| `/matches` | `MatchListPage` | Danh sách kèo đấu |
| `/matches/:id` | `MatchDetailPage` | Chi tiết kèo + điểm danh |
| `/payment-result` | `PaymentResultPage` | Kết quả thanh toán VnPay |
| `/login` | `LoginPage` | Đăng nhập |
| `/register` | `RegisterPage` | Đăng ký |
| `/forgot-password` | `ForgotPasswordPage` | Quên mật khẩu (OTP) |
| `/account` | `AccountPage` | Trang tài khoản (chưa login) |
| `/me` | `MePage` | Trang cá nhân (đã login) |
| `/profile` | `ProfilePage` | Chỉnh sửa hồ sơ |
| `/settings` | `SettingsPage` | Cài đặt ứng dụng |
| `/reservedBooking` | `MyBookingsPage` | Lịch sử đặt sân |
| `/owner/onboarding` | `OwnerOnboardingFlow` | Đăng ký chủ sân (multi-step) |
| `/owner` | `OwnerDashboardPage` | Dashboard chủ sân |
| `/owner/venues` | `OwnerVenuesPage` | Danh sách sân của chủ |
| `/owner/venues/:id` | `VenueConfigPage` | Cấu hình sân (courts, giá) |
| `/owner/bookings` | `OwnerBookingsPage` | Quản lý booking |
| `/admin/login` | `AdminLoginPage` | Đăng nhập admin |
| `/admin` | `AdminDashboardPage` | Dashboard admin |
| `/admin/users` | `AdminUsersPage` | Quản lý người dùng |
| `/admin/owner-requests` | `AdminOwnerRequestsPage` | Duyệt hồ sơ chủ sân |
| `/admin/sport-categories` | `AdminSportCategoriesPage` | Quản lý danh mục thể thao |
| `/admin/venues` | `AdminVenuesPage` | Quản lý sân |

### 3.4. Page Transition

- Sử dụng `Framer Motion` (`AnimatePresence` + `PageTransition` component)
- Khi chuyển tab ở BottomNavigation → hiệu ứng trượt trái/phải dựa theo thứ tự tab
- `BottomNavigation` ẩn trên các trang: login, register, payment-result, admin, owner

---

## 4. API Layer — `api/`

### `axiosClient.ts` — HTTP Client chính (User)

**Chức năng quan trọng:**
1. **Base URL:** `/api` (proxy qua Vite dev server tới Backend)
2. **Request Interceptor:** Tự động gắn `Authorization: Bearer <token>` từ `localStorage`
3. **Auto Token Refresh:** Khi token sắp hết hạn (còn <5 phút), tự gọi `/auth/refresh-token` ngầm để lấy token mới mà user không biết
4. **Response Interceptor:** Unwrap `response.data` (client nhận trực tiếp `{ isSuccess, data }` thay vì `{ data: { isSuccess, data } }`)
5. **Auto Logout:** Khi nhận 401/403 → xoá token + redirect `/login`

### `adminAxiosClient.ts` — HTTP Client riêng Admin

- Dùng `adminToken` (tách biệt hoàn toàn với token user thường)
- Khi 401/403 → redirect `/admin/login`

---

## 5. Services Layer — `services/`

Mỗi file service chứa các hàm gọi API tương ứng với một nhóm endpoint trên Backend.

| File | Endpoints gọi | Mô tả |
|------|---------------|-------|
| `authService.ts` | `/auth/*` | Login, register, get current user |
| `bookingService.ts` | `/bookings/*` | Tạo booking, lấy lịch sử, cập nhật trạng thái |
| `matchService.ts` | `/matches/*` | CRUD kèo đấu, join/leave, điểm danh, thêm khách ngoài |
| `ownerService.ts` | `/owner/*` | Quản lý venue, court, price, thống kê doanh thu |
| `publicService.ts` | `/venues/*` | Tìm kiếm sân công khai |
| `adminService.ts` | `/admin/*` | Quản trị hệ thống |
| `reviewService.ts` | `/reviews/*` | Tạo và lấy đánh giá |

**Mẫu code service:**
```typescript
export const matchService = {
  getAllMatches: (status?: string) => {
    return axiosClient.get('/matches', { params: { status } })
      .then(res => (res as any).data as MatchDto[]);
  },
  // ...
};
```

> **Lưu ý:** Mỗi service cũng export các **TypeScript interfaces** (DTO types) để type-safe.

---

## 6. Hooks Layer — `hooks/`

Sử dụng **React Query (TanStack Query)** để quản lý server state.

### 6.1. `queries/` — Đọc dữ liệu (useQuery)

| File | Hooks | Mô tả |
|------|-------|-------|
| `usePublicQueries.ts` | `useVenues`, `useVenueDetail` | Tìm kiếm và chi tiết sân |
| `useBookingQueries.ts` | `useMyBookings` | Lịch sử booking của user |
| `useMatchQueries.ts` | `useMatches`, `useMatchDetail` | Danh sách và chi tiết kèo |
| `useOwnerQueries.ts` | `useOwnerVenues`, `useOwnerStats` | Dữ liệu dashboard chủ sân |
| `useAdminQueries.ts` | `useAdminStats`, `useAdminUsers`, `useOwnerRequests` | Dữ liệu admin |
| `useReviewQueries.ts` | `useVenueReviews` | Đánh giá theo sân |

**Mẫu code:**
```typescript
export const useMatchDetail = (matchId: string) => {
  return useQuery({
    queryKey: ['matchDetail', matchId],
    queryFn: () => matchService.getMatchDetail(matchId),
  });
};
```

### 6.2. `mutations/` — Ghi dữ liệu (useMutation)

| File | Hooks | Mô tả |
|------|-------|-------|
| `useAuthMutations.ts` | `useLogin`, `useRegister` | Xác thực |
| `useBookingMutations.ts` | `useCreateBooking`, `useUpdateBookingStatus` | Đặt sân |
| `useMatchMutations.ts` | `useCreateMatch`, `useJoinMatch`, `useApproveJoinRequest`, `useUpdateAttendance`, `useAddExternalPlayer` ... | Kèo đấu |
| `useOwnerMutations.ts` | `useSaveDraft`, `useSubmitOnboarding`, `useCreateCourt` ... | Chủ sân |
| `useAdminMutations.ts` | `useApproveOwner`, `useRejectOwner` ... | Admin |
| `useReviewMutations.ts` | `useCreateReview` | Đánh giá |

**Quy tắc quan trọng:** Mỗi mutation đều gọi `queryClient.invalidateQueries()` trong `onSuccess` để **tự động cập nhật UI** sau khi thay đổi dữ liệu:
```typescript
export const useJoinMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.joinMatch(matchId),
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });         // Refetch danh sách
      queryClient.invalidateQueries({ queryKey: ['matchDetail', matchId] }); // Refetch chi tiết
    }
  });
};
```

### 6.3. Các hook khác

| File | Mô tả |
|------|-------|
| `queryKeys.ts` | Tập trung định nghĩa query keys (admin, owner) để tránh typo |
| `useSignalR.ts` | Hook kết nối SignalR Hub để nhận thông báo realtime |

---

## 7. Components — `components/`

### 7.1. `layout/` — Bố cục chung

| File | Mô tả |
|------|-------|
| `MainLayout.tsx` | Wrapper layout cho trang user (thêm padding bottom cho BottomNavigation) |
| `BottomNavigation.tsx` | Thanh điều hướng dưới cùng (5 tab: Home, Map, Explore, Matches, Account) |
| `PageTransition.tsx` | Animation wrapper dùng Framer Motion cho hiệu ứng trượt trang |

### 7.2. `common/` — Components dùng chung

| File | Mô tả |
|------|-------|
| `Preloader.tsx` | Splash screen khi app khởi động (animation Lottie) |
| `LoadingOverlay.tsx` | Overlay loading toàn màn hình (dùng cho Suspense fallback) |
| `GlobalNotification.tsx` | Component hiển thị thông báo realtime (SignalR) |
| `SubPageHeader.tsx` | Header cho trang con (nút Back + tiêu đề) |
| `LanguageSelectModal.tsx` | Modal chọn ngôn ngữ (Tiếng Việt / English) |

### 7.3. `auth/` — Form xác thực

| File | Mô tả |
|------|-------|
| `LoginForm.tsx` | Form đăng nhập (email/password + Google OAuth) |
| `RegisterForm.tsx` | Form đăng ký tài khoản |

---

## 8. Pages — `pages/`

### 8.1. `home/` — Trang công khai

| File | Size | Mô tả chi tiết |
|------|------|----------------|
| `HomePage.tsx` | 8KB | Trang chủ: banner hero, danh sách sân nổi bật, nút CTA |
| `ExplorePage.tsx` | 43KB | **Trang lớn nhất:** Tìm kiếm sân theo tên/vị trí/loại thể thao, bộ lọc nâng cao, hiển thị danh sách card sân |
| `MapPage.tsx` | 25KB | Bản đồ Google Maps: hiển thị marker sân, Place Autocomplete tìm kiếm, tính khoảng cách GPS (Haversine) |
| `VenueDetailPage.tsx` | 16KB | Chi tiết sân: thông tin, ảnh, danh sách courts, chọn ngày/giờ đặt sân, xem đánh giá |
| `MatchListPage.tsx` | 13KB | Danh sách kèo đấu: filter theo trạng thái (OPEN/FULL/CANCELLED), card hiển thị thông tin kèo |
| `MatchDetailPage.tsx` | 27KB | Chi tiết kèo: thông tin trận, danh sách thành viên, duyệt/từ chối yêu cầu, **điểm danh** (Đã đến/Vắng), **thêm thành viên ngoài** |
| `PaymentResultPage.tsx` | 5.5KB | Hiển thị kết quả thanh toán VnPay (thành công/thất bại) |

### 8.2. `auth/` — Xác thực

| File | Mô tả |
|------|-------|
| `LoginPage.tsx` | Trang đăng nhập (wrap LoginForm) |
| `RegisterPage.tsx` | Trang đăng ký (wrap RegisterForm) |
| `ForgotPasswordPage.tsx` | Quên mật khẩu: nhập email → nhận OTP → đặt lại mật khẩu (3 bước) |
| `AuthGuard.tsx` | Route Guard: kiểm tra token, redirect nếu chưa login |

### 8.3. `profile/` — Trang cá nhân

| File | Mô tả |
|------|-------|
| `AccountPage.tsx` | Trang tài khoản (khi chưa login): nút đăng nhập/đăng ký |
| `MePage.tsx` | Trang cá nhân (đã login): avatar, tên, menu điều hướng |
| `ProfilePage.tsx` | Chỉnh sửa hồ sơ: avatar, tên, email, SĐT |
| `SettingsPage.tsx` | Cài đặt: đổi ngôn ngữ, đổi mật khẩu, đăng xuất |
| `ChangePasswordPage.tsx` | Form đổi mật khẩu (mật khẩu cũ + mới) |
| `MyBookingsPage.tsx` | Lịch sử đặt sân: tabs theo trạng thái, tạo kèo đấu từ booking, viết đánh giá |

### 8.4. `owner/` — Trang chủ sân

| File | Size | Mô tả |
|------|------|-------|
| `OwnerGuard.tsx` | 1.1KB | Route Guard: kiểm tra role Owner |
| `OwnerLayout.tsx` | 6KB | Layout sidebar cho desktop (menu: Dashboard, Sân, Booking) |
| `OwnerOnboardingFlow.tsx` | 23KB | Multi-step form đăng ký chủ sân (5 bước): thông tin cơ bản → địa chỉ (Google Maps) → cấu hình sân → xác nhận → chờ duyệt |
| `OwnerDashboardPage.tsx` | 7.5KB | Dashboard: thống kê tổng quan (doanh thu, số booking, số sân) |
| `OwnerVenuesPage.tsx` | 1.3KB | Danh sách venues của owner |
| `VenueConfigPage.tsx` | 32KB | **Trang phức tạp nhất:** Cấu hình chi tiết sân (CRUD courts, CRUD price rules, quản lý trạng thái) |
| `OwnerBookingsPage.tsx` | 7.1KB | Quản lý booking: duyệt, xác nhận check-in, hủy |
| `OwnerView.tsx` | 0.7KB | Wrapper redirect tới dashboard |

### 8.5. `admin/` — Trang quản trị

| File | Mô tả |
|------|-------|
| `AdminGuard.tsx` | Route Guard: kiểm tra adminToken |
| `AdminLayout.tsx` | Layout sidebar desktop (import `admin.css` riêng biệt) |
| `AdminLoginPage.tsx` | Trang đăng nhập admin (cần SecretKey + username + password) |
| `AdminDashboardPage.tsx` | Dashboard: thống kê tổng (users, venues, bookings) |
| `AdminUsersPage.tsx` | Quản lý người dùng: tìm kiếm, khoá/mở tài khoản |
| `AdminOwnerRequestsPage.tsx` | Duyệt hồ sơ chủ sân: xem chi tiết draft, phê duyệt/từ chối kèm lý do |
| `AdminSportCategoriesPage.tsx` | CRUD danh mục thể thao (tên, icon, màu sắc) |
| `AdminVenuesPage.tsx` | Danh sách sân trong hệ thống |

---

## 9. CSS — Chiến lược tách biệt

| File | Mục đích | Khi nào load? |
|------|----------|---------------|
| `index.css` (38KB) | Styles chung cho PWA mobile-first: fonts, colors, buttons, cards, forms, responsive | Luôn load (trang nào cũng cần) |
| `admin.css` (18KB) | Styles riêng cho Admin desktop: sidebar layout, data tables, admin-specific typography | **Chỉ load khi truy cập `/admin/*`** (dynamic import trong `AdminLayout.tsx`) |

> **Tối ưu:** Tách CSS giúp user mobile không phải tải 18KB CSS admin không cần thiết.

---

## 10. Assets — `assets/`

```
assets/
├── fonts/          ← Font chữ local (Inter, Montserrat) — không phụ thuộc CDN
├── locales/        ← File ngôn ngữ JSON (vi.json, en.json) cho i18next
├── icon/           ← App icons
├── hero.png        ← Ảnh banner trang chủ
├── google-logo.svg ← Logo Google cho nút đăng nhập
├── preload.lottie  ← Animation splash screen
└── vn-flag.png     ← Cờ Việt Nam (chọn ngôn ngữ)
```

---

## 11. Luồng Dữ Liệu (Data Flow Pattern)

```
[User Action] → [Page Component] → [Mutation Hook] → [Service Function] → [Axios Client] → [Backend API]
                                                                                ↓
[UI Update] ← [React Query Cache Invalidation] ← [onSuccess callback] ← [API Response]
```

**Ví dụ cụ thể — Tham gia kèo đấu:**

```
1. User nhấn nút "Gửi yêu cầu tham gia"  (MatchDetailPage.tsx)
2. Gọi joinMutation.mutateAsync(matchId)   (useJoinMatch hook)
3. matchService.joinMatch(matchId)          (matchService.ts)
4. axiosClient.post('/matches/{id}/join')   (axiosClient.ts — gắn JWT)
5. Backend xử lý → trả về { isSuccess: true }
6. onSuccess: invalidateQueries(['matches', 'matchDetail'])
7. React Query tự refetch → UI cập nhật danh sách thành viên
```

---

## 12. Cách Thêm Tính Năng Mới (Checklist)

### Frontend:
1. **Service:** Thêm hàm gọi API mới vào file service tương ứng trong `services/`
2. **Hook:** Tạo `useQuery` (đọc) hoặc `useMutation` (ghi) trong `hooks/queries/` hoặc `hooks/mutations/`
3. **Page:** Import hook vào Page component, sử dụng `data`, `isLoading`, `mutateAsync`
4. **Route:** Nếu là trang mới, đăng ký route trong `App.tsx`

### Backend:
1. **Entity:** Định nghĩa entity mới trong `SportConnect.Core/Entities/`
2. **DbContext:** Đăng ký `DbSet` + cấu hình Fluent API trong `MyDbContext.cs`
3. **Interface:** Khai báo interface service trong `Application/Interfaces/`
4. **Service:** Hiện thực logic trong `Application/Services/`
5. **Controller:** Tạo controller mới trong `API/Controllers/`
6. **DI:** Đăng ký `AddScoped<IService, Service>()` trong `Program.cs`
