# Tài liệu Hướng dẫn Phát triển Backend - Sport Connect

Chào mừng bạn đến với dự án backend của Sport Connect. Dự án này được thiết kế theo mô hình **Clean Architecture** kết hợp với **Repository Pattern**. Tài liệu này sẽ giúp các thành viên trong nhóm hiểu rõ luồng đi của code, biết chính xác file nào cần sửa và tạo file mới ở đâu khi nhận một task.

---

## 1. Cấu trúc cây thư mục (Directory Tree)

Dưới đây là cây thư mục tổng quan của giải pháp (Solution) Backend. Các thư mục không quan trọng (bin, obj, Properties) đã được ẩn đi.

```text
Backend/
├── SportConnect.Core/                   # (Tầng Cốt lõi) - Không phụ thuộc vào bất kỳ ai
│   └── Entities/                        
│       ├── User.cs                      <- Các class tương đương với các bảng trong Database
│       ├── Venue.cs                     
│       └── ...                          
│
├── SportConnect.Application/            # (Tầng Ứng dụng) - Phụ thuộc vào Core
│   ├── DTOs/                            
│   │   └── Auth/                        
│   │       ├── LoginDto.cs              <- Các Object dùng để nhận/trả dữ liệu từ Client (Không dùng trực tiếp Entity)
│   │       └── RegisterDto.cs           
│   ├── Interfaces/                      
│   │   ├── IGenericRepository.cs        <- Giao diện của Repository dùng chung
│   │   ├── IUnitOfWork.cs               <- Giao diện quản lý transaction Database
│   │   └── IAuthService.cs              <- Giao diện của các Service xử lý logic nghiệp vụ
│   └── Services/                        
│       └── AuthService.cs               <- Chứa code logic nghiệp vụ thực tế (Ví dụ: băm mật khẩu, tạo token)
│
├── SportConnect.Infrastructure/         # (Tầng Cơ sở hạ tầng) - Phụ thuộc vào Core và Application
│   ├── Migrations/                      <- File lịch sử thay đổi Database (tạo tự động bởi EF Core)
│   └── Persistence/                     
│       ├── Context/                     
│       │   └── MyDbContext.cs           <- Cấu hình Entity Framework, kết nối các Entity xuống SQL Server
│       └── Repositories/                
│           ├── GenericRepository.cs     <- Implement của IGenericRepository (chứa các lệnh thêm, sửa, xóa, lấy DB)
│           └── UnitOfWork.cs            <- Implement của IUnitOfWork
│
└── SportConnect.API/                    # (Tầng Giao tiếp) - Phụ thuộc vào Application và Infrastructure
    ├── Controllers/                     
    │   └── AuthController.cs            <- Chứa các Endpoint API (VD: POST /api/auth/login). Nhận request từ UI.
    ├── appsettings.json                 <- File chứa chuỗi kết nối SQL Server, Secret Key của JWT...
    └── Program.cs                       <- Nơi đăng ký cấu hình, Dependency Injection (DI) và Middleware.
```

---

## 2. Quy trình của một Request (Data Flow)

Khi Frontend (ReactJS) gọi một API, dữ liệu sẽ đi qua các tầng theo thứ tự sau:

1. **Client (ReactJS)** gửi JSON Request đến API.
2. **API (Controller)**: Nhận Request, kiểm tra tính hợp lệ cơ bản, chuyển đổi JSON thành **DTO**. Sau đó, Controller gọi hàm từ **Service**.
3. **Application (Service)**: Nhận DTO từ Controller, thực hiện các logic nghiệp vụ phức tạp (ví dụ: kiểm tra trùng email, tính toán giá tiền). Sau đó gọi **Repository** thông qua **UnitOfWork**.
4. **Infrastructure (Repository / DbContext)**: Nhận yêu cầu từ Service, thao tác trực tiếp với **Database** (SQL Server).
5. **Database** trả kết quả ngược lên.
6. Kết quả quay ngược lại các tầng và trả về Client dưới dạng JSON (thông qua Response DTO).

> **Quy tắc bất di bất dịch:** Controller KHÔNG ĐƯỢC gọi thẳng xuống DbContext. Luôn luôn phải gọi qua Service -> UnitOfWork -> Repository.

---

## 3. Hướng dẫn làm Task cho Đồng Đội

Giả sử bạn được Leader giao một task: **"Làm chức năng Thêm, Xóa, Sửa, Xem danh sách Sân thể thao (Venue)"**.
Dưới đây là các bước bạn cần làm và những nơi bạn cần tạo/sửa file:

### Bước 1: Kiểm tra Tầng `Core` (Entities)
- **Hành động:** Mở `SportConnect.Core/Entities/Venue.cs`.
- **Mục đích:** Xem bảng Sân (Venue) có các cột gì (Id, Name, Address...). Nếu thiếu cột do yêu cầu mới, hãy thêm vào đây. *(Lưu ý: Nếu sửa Entity thì nhớ chạy lại lệnh Migration để cập nhật SQL).*

### Bước 2: Tạo DTOs ở Tầng `Application`
- **Hành động:** 
  - Tạo thư mục `SportConnect.Application/DTOs/Venue/`
  - Tạo file `CreateVenueDto.cs` (Chỉ chứa Name, Address... không chứa Id).
  - Tạo file `VenueResponseDto.cs` (Chứa Id, Name, Address... dùng để trả về UI).
- **Mục đích:** Giới hạn dữ liệu gửi lên và trả về, tránh lộ các trường nhạy cảm trong Database.

### Bước 3: Viết Logic ở Tầng `Application` (Interface & Service)
- **Hành động:**
  - **Tạo Interface:** `SportConnect.Application/Interfaces/IVenueService.cs`. 
    *(Định nghĩa các hàm: `Task<IEnumerable<VenueResponseDto>> GetAllAsync();`...)*
  - **Tạo Service:** `SportConnect.Application/Services/VenueService.cs`. 
    *(Implement Interface trên. Inject `IUnitOfWork` vào constructor. Viết code logic: Lấy data từ UnitOfWork, map data sang DTO và return).*
- **Mục đích:** Nơi duy nhất chứa "não bộ" của ứng dụng.

### Bước 4: Đăng ký Service vào DI
- **Hành động:** Mở `SportConnect.API/Program.cs`. Tìm đến mục `// Application Services`.
- **Thêm code:** `builder.Services.AddScoped<IVenueService, VenueService>();`
- **Mục đích:** Báo cho .NET biết cách khởi tạo `VenueService` khi có ai đó cần dùng.

### Bước 5: Viết API Controller ở Tầng `API`
- **Hành động:** Tạo file `SportConnect.API/Controllers/VenueController.cs`.
- **Viết code:** 
  - Đánh dấu `[ApiController]` và `[Route("api/[controller]")]`.
  - Inject `IVenueService` vào constructor.
  - Viết các hàm `[HttpGet]`, `[HttpPost]` và gọi hàm tương ứng từ `IVenueService`. Trả về `Ok()` hoặc `BadRequest()`.

> **Thực hành:** Mở `AuthController.cs` và `AuthService.cs` ra xem để lấy mẫu (Template). Toàn bộ luồng CRUD đều theo khuôn mẫu giống hệt như thế này!
