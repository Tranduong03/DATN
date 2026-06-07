# Sport Connect - Implementation Plan

Xây dựng hệ thống **Sport Connect** gồm Backend C# .NET Web API và Frontend ReactJS PWA, kết nối với SQL Server database đã có sẵn schema.

## Thông tin môi trường

| Tool | Version |
|------|---------|
| .NET SDK | 9.0.100-preview → sẽ dùng target `net8.0` (stable) |
| Node.js | v22.14.0 |
| npm | 10.9.2 |
| Database | SQL Server (schema đã có sẵn) |

---

## User Review Required

> [!IMPORTANT]
> **Connection String**: Bạn cần cung cấp thông tin kết nối SQL Server:
> - Server name (ví dụ: `localhost`, `.\SQLEXPRESS`, etc.)
> - Database name (ví dụ: `SportConnectDB`)
> - Authentication: Windows Authentication hay SQL Server Authentication (user/password)?

> [!IMPORTANT]
> **.NET SDK Version**: Máy bạn cài .NET 9.0 preview. Bạn muốn dùng `.NET 8` (LTS, stable) hay `.NET 9` (preview)?

> [!WARNING]
> **Frontend Port**: Backend sẽ chạy trên port `5000/5001`, Frontend trên port `5173`. CORS sẽ được cấu hình tương ứng.

## Open Questions

1. Bạn có muốn sử dụng **Docker** cho database không, hay dùng SQL Server đã cài sẵn trên máy?
2. Frontend có cần hỗ trợ **đa ngôn ngữ** (i18n) ngay từ đầu không?
3. Có cần tích hợp **upload ảnh** (avatar, receipt, QR) lên cloud storage (Azure Blob, Cloudinary) hay lưu local?

---

## Proposed Changes

### Cấu trúc thư mục tổng quan

```
d:\IT\HK2_Y4\DATN\
├── Data/                          # SQL scripts (đã có)
├── Document/                      # Tài liệu (đã có)
├── backend/                       # ← MỚI: .NET Solution
│   ├── SportConnect.sln
│   ├── SportConnect.API/          # Web API (Controllers, Middleware)
│   ├── SportConnect.Core/         # Domain Entities, Interfaces
│   ├── SportConnect.Application/  # Business Logic, DTOs, Services
│   └── SportConnect.Infrastructure/ # EF Core, Repositories, External Services
└── frontend/                      # ← MỚI: React PWA (Vite)
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── services/              # API calls (axios)
    │   ├── hooks/
    │   ├── context/
    │   └── utils/
    ├── index.html
    └── vite.config.js
```

---

## PHẦN 1: BACKEND (C# .NET Web API — Clean Architecture)

### 1.1 SportConnect.Core (Class Library)

> Domain layer — chứa Entities và Interfaces, không phụ thuộc bất kỳ layer nào.

#### [NEW] `backend/SportConnect.Core/SportConnect.Core.csproj`

Project file cho Core layer, target `net8.0`, không có dependency ngoài.

#### [NEW] `backend/SportConnect.Core/Entities/`

Các entity class map 1-1 với database schema:

```csharp
// User.cs
public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public double TrustScore { get; set; } = 5.0;
    public int NoShowCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
    public bool Status { get; set; } = true;

    // Navigation
    public ICollection<UserRole> UserRoles { get; set; }
    public ICollection<Venue> OwnedVenues { get; set; }
    public ICollection<Booking> Bookings { get; set; }
    public ICollection<Match> HostedMatches { get; set; }
    public ICollection<MatchPlayer> MatchPlayers { get; set; }
}
```

Tương tự cho: `Role`, `UserRole`, `Permission`, `RolePermission`, `Venue`, `Booking`, `Match`, `MatchPlayer`.

#### [NEW] `backend/SportConnect.Core/Interfaces/`

Repository interfaces:

```csharp
public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetWithRolesAsync(Guid userId);
}

public interface IVenueRepository : IGenericRepository<Venue> { ... }
public interface IBookingRepository : IGenericRepository<Booking> { ... }
public interface IMatchRepository : IGenericRepository<Match> { ... }
public interface IUnitOfWork : IDisposable { ... }
```

---

### 1.2 SportConnect.Application (Class Library)

> Application layer — DTOs, Service interfaces/implementations, mapping logic.

#### [NEW] `backend/SportConnect.Application/SportConnect.Application.csproj`

Dependencies: `SportConnect.Core`, `AutoMapper`, `FluentValidation`.

#### [NEW] `backend/SportConnect.Application/DTOs/`

```
DTOs/
├── Auth/
│   ├── LoginRequestDto.cs        # { username, password }
│   ├── RegisterRequestDto.cs     # { username, email, password, fullName, phone }
│   └── AuthResponseDto.cs        # { token, refreshToken, user }
├── User/
│   ├── UserDto.cs                # Public user info (no password)
│   └── UpdateUserDto.cs
├── Venue/
│   ├── VenueDto.cs
│   ├── CreateVenueDto.cs
│   └── UpdateVenueDto.cs
├── Booking/
│   ├── BookingDto.cs
│   ├── CreateBookingDto.cs
│   └── UpdateBookingStatusDto.cs
└── Match/
    ├── MatchDto.cs
    ├── CreateMatchDto.cs
    └── JoinMatchDto.cs
```

#### [NEW] `backend/SportConnect.Application/Services/`

```csharp
public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
}

public interface IVenueService
{
    Task<IEnumerable<VenueDto>> GetAllAsync();
    Task<VenueDto?> GetByIdAsync(Guid id);
    Task<VenueDto> CreateAsync(Guid ownerId, CreateVenueDto dto);
    Task<VenueDto> UpdateAsync(Guid id, UpdateVenueDto dto);
    Task DeleteAsync(Guid id);
}

// Tương tự: IUserService, IBookingService, IMatchService
```

#### [NEW] `backend/SportConnect.Application/Mappings/MappingProfile.cs`

AutoMapper profiles: Entity ↔ DTO.

---

### 1.3 SportConnect.Infrastructure (Class Library)

> Data access layer — EF Core DbContext, Repository implementations, JWT service.

#### [NEW] `backend/SportConnect.Infrastructure/SportConnect.Infrastructure.csproj`

Dependencies: `SportConnect.Core`, `Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.AspNetCore.Authentication.JwtBearer`.

#### [NEW] `backend/SportConnect.Infrastructure/Data/SportConnectDbContext.cs`

```csharp
public class SportConnectDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<Venue> Venues { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Match> Matches { get; set; }
    public DbSet<MatchPlayer> MatchPlayers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Composite keys
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });
        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });
        modelBuilder.Entity<MatchPlayer>()
            .HasKey(mp => new { mp.MatchId, mp.UserId });

        // Relationships, constraints...
    }
}
```

#### [NEW] `backend/SportConnect.Infrastructure/Repositories/`

Generic repository + specific repositories implementing Core interfaces.

#### [NEW] `backend/SportConnect.Infrastructure/Services/JwtService.cs`

JWT token generation & validation service.

---

### 1.4 SportConnect.API (ASP.NET Core Web API)

> Presentation layer — Controllers, Middleware, Program.cs configuration.

#### [NEW] `backend/SportConnect.API/SportConnect.API.csproj`

Dependencies: `SportConnect.Application`, `SportConnect.Infrastructure`, `Swashbuckle.AspNetCore` (Swagger).

#### [NEW] `backend/SportConnect.API/Program.cs`

```csharp
// Key configurations:
// 1. DbContext + ConnectionString
// 2. JWT Authentication
// 3. CORS (allow frontend origin)
// 4. Swagger
// 5. Dependency Injection (repos, services)
// 6. Exception handling middleware
```

#### [NEW] `backend/SportConnect.API/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=SportConnectDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "SecretKey": "SportConnect-SuperSecret-Key-2026-DATN",
    "Issuer": "SportConnect",
    "Audience": "SportConnectApp",
    "ExpirationInMinutes": 60
  }
}
```

#### [NEW] `backend/SportConnect.API/Controllers/`

```
Controllers/
├── AuthController.cs         # POST /api/auth/login, /register, /refresh
├── UsersController.cs        # GET/PUT /api/users/{id}, GET /api/users/me
├── VenuesController.cs       # CRUD /api/venues
├── BookingsController.cs     # CRUD /api/bookings
└── MatchesController.cs      # CRUD /api/matches, POST /api/matches/{id}/join
```

**API Endpoints chi tiết:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| `POST` | `/api/auth/login` | Đăng nhập, trả JWT | ❌ |
| `GET` | `/api/users/me` | Lấy thông tin user hiện tại | ✅ |
| `PUT` | `/api/users/{id}` | Cập nhật profile | ✅ |
| `GET` | `/api/venues` | Danh sách sân | ❌ |
| `GET` | `/api/venues/{id}` | Chi tiết sân | ❌ |
| `POST` | `/api/venues` | Tạo sân (Owner) | ✅ OWNER |
| `PUT` | `/api/venues/{id}` | Sửa sân | ✅ OWNER |
| `DELETE` | `/api/venues/{id}` | Xóa sân | ✅ OWNER |
| `GET` | `/api/bookings` | Danh sách đặt sân | ✅ |
| `POST` | `/api/bookings` | Đặt sân | ✅ PLAYER |
| `PUT` | `/api/bookings/{id}/status` | Duyệt/hủy booking | ✅ OWNER |
| `GET` | `/api/matches` | Danh sách kèo đấu | ❌ |
| `GET` | `/api/matches/{id}` | Chi tiết kèo | ❌ |
| `POST` | `/api/matches` | Tạo kèo (Host) | ✅ PLAYER |
| `POST` | `/api/matches/{id}/join` | Xin vào kèo (Guest) | ✅ PLAYER |
| `PUT` | `/api/matches/{id}/players/{userId}` | Duyệt/từ chối player | ✅ Host |

#### [NEW] `backend/SportConnect.API/Middleware/ExceptionMiddleware.cs`

Global exception handling → trả JSON error response chuẩn.

---

## PHẦN 2: FRONTEND (ReactJS PWA — Vite)

### 2.1 Khởi tạo project

```bash
npx -y create-vite@latest ./ --template react
npm install react-router-dom axios
npm install -D vite-plugin-pwa
```

### 2.2 Cấu trúc thư mục

```
frontend/src/
├── assets/                    # Images, icons, fonts
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx         # Navigation bar
│   │   ├── Sidebar.jsx        # Side menu
│   │   └── Footer.jsx
│   ├── ui/
│   │   ├── Button.jsx         # Reusable button
│   │   ├── Card.jsx           # Card component
│   │   ├── Modal.jsx          # Modal dialog
│   │   ├── Input.jsx          # Form input
│   │   └── Loader.jsx         # Loading spinner
│   └── shared/
│       ├── ProtectedRoute.jsx # Route guard (auth check)
│       └── RoleGuard.jsx      # Role-based access
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── home/
│   │   └── HomePage.jsx       # Landing page / Dashboard
│   ├── venues/
│   │   ├── VenueListPage.jsx
│   │   └── VenueDetailPage.jsx
│   ├── bookings/
│   │   ├── BookingListPage.jsx
│   │   └── CreateBookingPage.jsx
│   ├── matches/
│   │   ├── MatchListPage.jsx
│   │   ├── MatchDetailPage.jsx
│   │   └── CreateMatchPage.jsx
│   └── profile/
│       └── UserProfile.tsx
├── services/
│   ├── api.js                 # Axios instance + interceptors
│   ├── authService.js         # Login, register, refresh
│   ├── venueService.js        # CRUD venues
│   ├── bookingService.js      # CRUD bookings
│   └── matchService.js        # CRUD matches
├── context/
│   └── AuthContext.jsx        # Auth state (user, token, login/logout)
├── hooks/
│   ├── useAuth.js             # Custom hook for auth
│   └── useFetch.js            # Generic data fetching hook
├── utils/
│   ├── constants.js           # API_BASE_URL, etc.
│   └── helpers.js             # Format date, currency, etc.
├── App.jsx                    # Root component + Router
├── App.css                    # Global styles
├── index.css                  # CSS reset + design tokens
└── main.jsx                   # Entry point
```

### 2.3 Key Frontend Features

#### Routing (react-router-dom v6)

```jsx
<Routes>
  {/* Public */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/venues" element={<VenueListPage />} />
  <Route path="/venues/:id" element={<VenueDetailPage />} />
  <Route path="/matches" element={<MatchListPage />} />
  <Route path="/matches/:id" element={<MatchDetailPage />} />

  {/* Protected */}
  <Route element={<ProtectedRoute />}>
    <Route path="/UserProfile" element={<UserProfile />} />
    <Route path="/bookings" element={<BookingListPage />} />
    <Route path="/bookings/create" element={<CreateBookingPage />} />
    <Route path="/matches/create" element={<CreateMatchPage />} />
  </Route>

  {/* Owner routes */}
  <Route element={<RoleGuard roles={['OWNER']} />}>
    <Route path="/owner/venues" element={<OwnerVenueManagement />} />
  </Route>
</Routes>
```

#### API Service Layer (Axios)

```javascript
// services/api.js
const api = axios.create({
  baseURL: 'https://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Attempt token refresh...
    }
    return Promise.reject(error);
  }
);
```

#### PWA Configuration (vite-plugin-pwa)

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sport Connect',
        short_name: 'SportConnect',
        theme_color: '#1a73e8',
        icons: [...]
      }
    })
  ]
});
```

### 2.4 Design System

| Token | Value |
|-------|-------|
| Primary Color | `#1a73e8` (Vibrant Blue) |
| Secondary Color | `#00c853` (Sport Green) |
| Accent | `#ff6d00` (Orange) |
| Dark BG | `#0f172a` (Slate 900) |
| Card BG | `rgba(255,255,255,0.05)` (Glass) |
| Font | `Inter` (Google Fonts) |
| Border Radius | `12px` |
| Animations | `cubic-bezier(0.4, 0, 0.2, 1)` |

---

## Thứ tự thực hiện (Execution Order)

### Phase 1: Backend Foundation ⬅️ *Làm trước*
1. Tạo .NET Solution + 4 projects (API, Core, Application, Infrastructure)
2. Tạo Entities trong Core layer
3. Cấu hình DbContext + kết nối database
4. Implement Generic Repository + UnitOfWork
5. Tạo DTOs + AutoMapper profiles
6. Implement AuthService (JWT)
7. Tạo Controllers (Auth → Users → Venues → Bookings → Matches)
8. Cấu hình Swagger + CORS
9. Test API bằng Swagger UI

### Phase 2: Frontend Foundation
10. Khởi tạo Vite + React project
11. Cấu hình PWA + Design System (CSS)
12. Tạo layout components (Navbar, Sidebar, Footer)
13. Tạo AuthContext + API service layer
14. Build pages: Auth → Home → Venues → Matches → Bookings
15. Implement routing + protected routes

### Phase 3: Integration & Polish
16. Kết nối Frontend ↔ Backend
17. Test end-to-end flows
18. PWA optimization (offline, install prompt)
19. Responsive design polish

---

## Verification Plan

### Automated Tests
```bash
# Backend: chạy và test Swagger
cd backend/SportConnect.API
dotnet run
# Mở browser: https://localhost:5001/swagger

# Frontend: dev server
cd frontend
npm run dev
# Mở browser: http://localhost:5173
```

### Manual Verification
- Swagger UI: Test tất cả API endpoints
- Đăng ký → Đăng nhập → Nhận JWT → Gọi protected API
- Frontend: Đăng nhập → Xem sân → Đặt sân → Tạo kèo → Tham gia kèo
- PWA: Install app trên mobile browser
