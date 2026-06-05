# SportConnect — Giải Thích Mã Nguồn Backend (.NET Core 9)

> Tài liệu này giải thích chi tiết từng file, từng thư mục trong mã nguồn Backend để intern có thể đọc hiểu và bắt đầu phát triển tính năng mới.

---

## 1. Tổng Quan Kiến Trúc (Clean Architecture)

Backend được chia thành **4 project** trong solution `SportConnect.sln`:

```
Backend/
├── SportConnect.Core/           ← Tầng Domain (Entities)
├── SportConnect.Application/    ← Tầng Nghiệp vụ (Services, DTOs, Interfaces)
├── SportConnect.Infrastructure/ ← Tầng Hạ tầng (Database, External Services)
└── SportConnect.API/            ← Tầng Trình bày (Controllers, Middleware)
```

**Nguyên tắc phụ thuộc:** `API → Application → Core` và `Infrastructure → Application → Core`. Tầng Core không phụ thuộc bất kỳ tầng nào khác.

---

## 2. SportConnect.Core — Tầng Domain

Chứa các **Entity classes** ánh xạ trực tiếp tới các bảng trong SQL Server.

### 2.1. Danh sách Entities

| File | Bảng DB | Mô tả |
|------|---------|-------|
| `User.cs` | `Users` | Người dùng hệ thống. Chứa: `Username`, `Email`, `PasswordHash`, `GoogleId` (đăng nhập Google), `TrustScore` (điểm uy tín), `NoShowCount` (số lần vắng mặt). |
| `Role.cs` | `Roles` | Vai trò: `Default`, `Owner`, `Admin`. |
| `User_Role.cs` | `User_Roles` | Bảng trung gian nhiều-nhiều giữa `User` và `Role`. |
| `Venue.cs` | `Venues` | Cơ sở sân thể thao. Chứa: `Name`, `Address`, `OperatingStartHour/EndHour`, `SportTypes` (danh sách môn thể thao dạng JSON), `VenueScale` (số sân tối đa), `AverageRating`, `ReviewCount`. |
| `Court.cs` | `Courts` | Sân con thuộc một Venue. Ví dụ: "Sân số 1", "Sân VIP". Trạng thái: `AVAILABLE`, `MAINTENANCE`. |
| `PriceRule` (Price.cs) | `PriceRules` | Quy tắc giá theo khung giờ và ngày trong tuần. `DayOfWeek`: 0=CN, 1-6=T2-T7, null=tất cả ngày. |
| `Booking.cs` | `Bookings` | Đơn đặt sân. Trạng thái: `HOLDING` → `PENDING` → `CONFIRMED` / `CANCELLED`. |
| `Match.cs` | `Matches` | Kèo đấu ghép đội. Trạng thái: `OPEN` → `FULL` → `COMPLETED` / `CANCELLED`. |
| `MatchPlayer.cs` | `Match_Players` | Bảng trung gian: người chơi tham gia kèo. Trạng thái: `PENDING` → `APPROVED` → `ATTENDED` / `NO_SHOW` / `REJECTED`. |
| `OwnerProfile.cs` | `OwnerProfiles` | Hồ sơ đăng ký chủ sân. `OnboardingStatus`: `NotStarted`/`InProgress`/`Completed`. `VerificationStatus`: `None`/`Pending`/`Verified`/`Rejected`. |
| `Review.cs` | `Reviews` | Đánh giá sân (1-5 sao + bình luận), liên kết tới `User`, `Venue`, `Booking`. |
| `Notification.cs` | `Notifications` | Thông báo realtime tới người dùng (qua SignalR). |
| `SportCategory.cs` | `SportCategories` | Danh mục môn thể thao (Bóng đá, Cầu lông, Bóng rổ...) do Admin quản lý. |
| `FavoriteVenue.cs` | `FavoriteVenues` | Bảng yêu thích sân, liên kết `User ↔ Venue`. |
| `VenueImage.cs` | `VenueImages` | Ảnh minh họa của sân. |
| `StaffVenuePermission` (Staff.cs) | `StaffVenuePermissions` | Phân quyền nhân viên cho từng sân cụ thể. |
| `Staff_Code.cs` | `StaffCodes` | Mã mời nhân viên do chủ sân tạo ra. |
| `ActivityLog` (Activity.cs) | `ActivityLogs` | Nhật ký hoạt động (ai làm gì, lúc nào, IP nào). |

### 2.2. Cách đọc một Entity

Ví dụ `Booking.cs`:
```csharp
public class Booking
{
    public Guid Id { get; set; }          // Khóa chính tự sinh
    public Guid BookerId { get; set; }    // FK tới User
    public Guid CourtId { get; set; }     // FK tới Court
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; }    // HOLDING, PENDING, CONFIRMED, CANCELLED

    // Navigation properties — EF Core tự JOIN khi cần
    public User Booker { get; set; } = null!;
    public Court Court { get; set; } = null!;
    public Match? Match { get; set; }     // Nullable: booking có thể không gắn kèo
}
```

> **Quy ước:** Mọi khóa chính đều dùng `Guid`. Navigation properties giúp EF Core biết mối quan hệ giữa các bảng.

---

## 3. SportConnect.Application — Tầng Nghiệp vụ

### 3.1. Interfaces/ — Khai báo hợp đồng

| File | Mô tả |
|------|-------|
| `IGenericRepository<T>` | Repository tổng quát: `GetByIdAsync`, `GetAllAsync`, `FindAsync` (tìm theo điều kiện), `AddAsync`, `Update`, `Remove`. |
| `IUnitOfWork` | Quản lý transaction. Gọi `Repository<T>()` để lấy repository, gọi `CompleteAsync()` để lưu tất cả thay đổi vào DB. |
| `IAuthService` | Đăng ký, đăng nhập (email/Google), đổi mật khẩu, quên mật khẩu, refresh token. |
| `IBookingService` | Tạo booking, lấy danh sách booking, cập nhật trạng thái (confirm/cancel/check-in). |
| `IMatchService` | CRUD kèo đấu, duyệt/từ chối người chơi, điểm danh, thêm thành viên ngoài. |
| `IOwnerVenueService` | Quản lý sân cho chủ sân: CRUD venue, court, price rules, thống kê. |
| `IOwnerOnboardingService` | Luồng đăng ký chủ sân: lưu draft, submit, kiểm tra trạng thái. |
| `IPublicVenueService` | API công khai: tìm kiếm sân, lấy chi tiết sân, lấy khung giờ trống. |
| `IAdminService` | Quản trị: thống kê tổng quan, phê duyệt/từ chối chủ sân. |
| `ISportCategoryService` | CRUD danh mục thể thao. |
| `IReviewService` | Tạo và lấy đánh giá sân. |
| `IVnPayService` | Tạo URL thanh toán VnPay, xử lý callback trả về. |
| `IEmailService` | Gửi email (OTP quên mật khẩu). |
| `INotificationService` | CRUD thông báo cho user. |
| `INotificationPublisher` | Gửi thông báo realtime qua SignalR Hub. |
| `IFavoriteVenueService` | Thêm/xoá/kiểm tra sân yêu thích. |
| `IAdminRepository` | Repository riêng cho admin (thống kê phức tạp). |

### 3.2. DTOs/ — Data Transfer Objects

DTOs che giấu dữ liệu nhạy cảm (PasswordHash, internal IDs) khi trả về cho client.

```
DTOs/
├── Auth/               ← LoginDto, RegisterDto, GoogleLoginDto, ChangePasswordDto, ForgotPasswordDto, AdminLoginDto
├── Public/             ← PublicVenueDtos (tìm kiếm sân), MatchDtos, ReviewDto
├── Owner/              ← VenueManagementDtos, OwnerDashboardStatsDto
├── OwnerOnboarding/    ← OnboardingStatusDto, SaveDraftDto
├── Admin/              ← UserListItemDto, OwnerRequestDto, OwnerRequestDetailDto, SportCategoryDto
├── FavoriteVenueDto.cs
└── NotificationDto.cs
```

### 3.3. Services/ — Logic nghiệp vụ chính

| File | Chức năng chính |
|------|----------------|
| `AuthService.cs` (13.9KB) | **Xác thực:** Hash password bằng BCrypt, tạo JWT token (chứa `nameid`, `role`, `email`), đăng nhập Google (xác minh `GoogleId`), gửi OTP qua email để reset password, refresh token tự động. |
| `BookingService.cs` (13KB) | **Đặt sân:** Kiểm tra trùng lịch (double booking prevention), tính giá theo `PriceRule`, tạo booking `HOLDING` (giữ chỗ 15 phút), xác nhận/hủy booking, lấy lịch sử booking của user và owner. |
| `MatchService.cs` (14.9KB) | **Ghép đội:** Tạo kèo từ booking, quản lý yêu cầu tham gia (PENDING→APPROVED/REJECTED), tự động chuyển trạng thái FULL khi đủ người, điểm danh (ATTENDED/NO_SHOW), thêm thành viên ngoài (Guest User). |
| `OwnerVenueService.cs` (9.1KB) | **Quản lý sân:** CRUD venue, tự sinh courts theo template, CRUD price rules, thống kê doanh thu. |
| `OwnerOnboardingService.cs` (5.7KB) | **Đăng ký chủ sân:** Lưu draft từng bước (multi-step form), submit hồ sơ để Admin phê duyệt, tạo Venue + Courts khi được duyệt. |
| `PublicVenueService.cs` (4.8KB) | **Tìm kiếm công khai:** Lấy danh sách sân (có filter), lấy chi tiết sân + courts + prices, lấy khung giờ đã đặt. |
| `AdminService.cs` (2KB) | **Quản trị:** Thống kê tổng quan (số user, venue, booking), phê duyệt/từ chối hồ sơ chủ sân. |
| `SportCategoryService.cs` (2.8KB) | CRUD danh mục thể thao. |
| `ReviewService.cs` (3.8KB) | Tạo đánh giá (cập nhật `AverageRating` + `ReviewCount` của Venue), lấy danh sách review theo venue. |
| `EmailService.cs` (2KB) | Gửi email qua SMTP (Gmail). |

**Mẫu code Service tiêu biểu (MatchService):**
```csharp
public async Task<bool> JoinMatchAsync(Guid matchId, Guid userId)
{
    var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
    if (match == null) throw new Exception("Match not found");
    if (match.HostId == userId) throw new Exception("Host cannot join their own match");

    var matchPlayer = new MatchPlayer { MatchId = matchId, UserId = userId, Status = "PENDING" };
    await _unitOfWork.Repository<MatchPlayer>().AddAsync(matchPlayer);
    await _unitOfWork.CompleteAsync();  // ← Lưu vào DB
    return true;
}
```

---

## 4. SportConnect.Infrastructure — Tầng Hạ tầng

### 4.1. Persistence/

| File/Folder | Mô tả |
|-------------|-------|
| `Context/MyDbContext.cs` | Cấu hình EF Core: DbSet cho tất cả entity, Fluent API mapping (tên bảng, tên cột, khóa chính composite, quan hệ FK, cascade delete rules). **Đây là file quan trọng nhất** để hiểu cấu trúc DB. |
| `Repositories/GenericRepository.cs` | Hiện thực `IGenericRepository<T>` bằng EF Core. |
| `Repositories/UnitOfWork.cs` | Hiện thực `IUnitOfWork`: cache repository instances, gọi `_context.SaveChangesAsync()`. |
| `Repositories/AdminRepository.cs` | Repository riêng cho admin (raw SQL queries phức tạp). |
| `Migrations/` | EF Core migrations (lịch sử thay đổi schema DB). |

### 4.2. Services/

| File | Mô tả |
|------|-------|
| `VnPayService.cs` | Tạo URL thanh toán VnPay (sắp xếp params alphabet + HMAC-SHA512), xử lý IPN callback. |
| `VnPayLibrary.cs` | Thư viện hỗ trợ: sắp xếp params, tạo chữ ký HMAC-SHA512. |
| `NotificationService.cs` | CRUD notification trong DB. |
| `FavoriteVenueService.cs` | Toggle yêu thích sân. |
| `ActivityLogService.cs` | Ghi nhật ký hoạt động. |
| `StaffPermissionService.cs` | Kiểm tra quyền nhân viên trên venue. |

---

## 5. SportConnect.API — Tầng Trình bày

### 5.1. Program.cs — Điểm khởi động ứng dụng

File này cấu hình toàn bộ Dependency Injection và middleware pipeline:

```
1. Đăng ký DbContext (SQL Server)
2. Đăng ký Repository & UnitOfWork
3. Đăng ký tất cả Application Services (AddScoped)
4. Cấu hình JWT Authentication
5. Cấu hình CORS (cho phép Frontend localhost:5173 gọi API)
6. Cấu hình Swagger (chỉ dev)
7. Cấu hình SignalR Hub
```

**Middleware pipeline (thứ tự quan trọng):**
```
GlobalExceptionMiddleware → Swagger → CORS → Authentication → Authorization → Controllers → SignalR Hub
```

### 5.2. Controllers/ — 12 API Controllers

| Controller | Route | Mô tả |
|-----------|-------|-------|
| `AuthController` | `/api/auth/*` | `POST /login`, `POST /register`, `POST /google-login`, `POST /refresh-token`, `POST /forgot-password`, `PUT /change-password`, `GET /me`. |
| `PublicVenueController` | `/api/venues/*` | `GET /` (tìm kiếm + filter), `GET /{id}` (chi tiết), `GET /{id}/booked-slots` (khung giờ đã đặt). |
| `BookingController` | `/api/bookings/*` | `POST /` (tạo booking), `GET /my` (lịch sử user), `GET /owner` (lịch sử owner), `PUT /{id}/status` (cập nhật trạng thái). |
| `PaymentController` | `/api/payment/*` | `POST /create-url` (tạo URL VnPay), `GET /vnpay-return` (callback). |
| `MatchController` | `/api/matches/*` | CRUD kèo đấu, join/approve/reject, điểm danh, thêm thành viên ngoài. |
| `OwnerOnboardingController` | `/api/owner/onboarding/*` | Lưu draft, submit, lấy trạng thái hồ sơ. |
| `OwnerVenueController` | `/api/owner/venues/*` | CRUD venue/court/price, thống kê doanh thu. |
| `AdminController` | `/api/admin/*` | Thống kê, quản lý users, phê duyệt owner requests. |
| `SportCategoriesController` | `/api/sport-categories/*` | CRUD danh mục thể thao. |
| `ReviewController` | `/api/reviews/*` | Tạo và lấy đánh giá. |
| `NotificationsController` | `/api/notifications/*` | Lấy, đánh dấu đã đọc, xoá thông báo. |
| `FavoriteVenuesController` | `/api/favorites/*` | Toggle và lấy danh sách sân yêu thích. |

### 5.3. Các file hỗ trợ khác

| File | Mô tả |
|------|-------|
| `Middleware/GlobalExceptionMiddleware.cs` | Bắt tất cả exception chưa xử lý, trả về JSON `{ isSuccess: false, message: "..." }` thay vì crash 500. |
| `Hubs/NotificationHub.cs` | SignalR Hub cho thông báo realtime. Client kết nối qua `/hubs/notification`. |
| `Seeders/AdminSeeder.cs` | Tự tạo tài khoản Admin mặc định khi DB trống (đọc từ `appsettings.json > AdminSettings`). |
| `appsettings.json` | Template cấu hình (DB connection, JWT secret, VnPay keys, SMTP). |
| `appsettings.Development.json` | Cấu hình thực tế cho môi trường dev local. |

---

## 6. Luồng Xử Lý Một Request (Ví dụ: Đặt sân)

```
[Frontend] POST /api/bookings { courtId, startTime, endTime }
    ↓
[Program.cs] Authentication Middleware → Xác thực JWT token
    ↓
[BookingController.cs] CreateBooking() → Lấy userId từ JWT Claims
    ↓
[BookingService.cs] CreateBookingAsync()
    ├── Kiểm tra court tồn tại (Repository<Court>)
    ├── Kiểm tra trùng lịch (Repository<Booking>.FindAsync)
    ├── Tính giá theo PriceRule
    ├── Tạo Booking { Status = "HOLDING" }
    ├── _unitOfWork.CompleteAsync() → Lưu DB
    └── Return BookingDto
    ↓
[BookingController.cs] return Ok({ isSuccess: true, data: bookingDto })
    ↓
[Frontend] Nhận response → Chuyển sang trang thanh toán VnPay
```
