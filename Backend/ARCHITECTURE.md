# Kiến trúc Backend - Sport Connect

Dự án Backend của **Sport Connect** được xây dựng dựa trên **Clean Architecture** kết hợp với **Repository Pattern** và **Unit of Work** trong môi trường **.NET (C#)**. 

Mục tiêu của kiến trúc này là tách biệt các thành phần (Separation of Concerns), giúp code dễ bảo trì, dễ test và linh hoạt khi có sự thay đổi về công nghệ.

## Cấu trúc các Layer (Lớp)

Dự án được chia thành 4 project nhỏ (tương ứng với 4 layer chính):

### 1. SportConnect.Core (Lớp trung tâm / Domain Layer)
Đây là trái tim của hệ thống. Nó chứa các định nghĩa cốt lõi nhất và không phụ thuộc vào bất kỳ project hay thư viện bên ngoài nào (kể cả Entity Framework).

* **Entities (`/Entities`)**: Chứa các class đại diện cho các bảng trong CSDL (Ví dụ: `User`, `Role`, `Booking`, `Match`, `Venue`, `Court`, `PriceRule`, v.v.).
* **Nguyên tắc**: Không có logic nghiệp vụ phức tạp hoặc thao tác truy xuất dữ liệu ở đây, chỉ chứa cấu trúc dữ liệu cơ bản.

### 2. SportConnect.Application (Lớp Ứng dụng / Use Cases)
Lớp này chứa toàn bộ **Logic Nghiệp vụ (Business Logic)** của ứng dụng. Nó chỉ phụ thuộc vào lớp `Core`.

* **Interfaces (`/Interfaces`)**: Định nghĩa các hợp đồng (contract) cho các Service, Repository và UnitOfWork (Ví dụ: `IAuthService`, `IGenericRepository`, `IUnitOfWork`).
* **DTOs (`/DTOs`)**: Data Transfer Objects - các đối tượng dùng để truyền tải dữ liệu giữa Client và Server mà không làm lộ các Entity (Ví dụ: `LoginDto`, `RegisterDto` trong `/Auth`).
* **Services (`/Services`)**: Nơi triển khai logic nghiệp vụ thực tế (Ví dụ: `AuthService` xử lý việc đăng nhập, đăng ký, băm mật khẩu và tạo JWT token).

### 3. SportConnect.Infrastructure (Lớp Hạ tầng / Persistence Layer)
Lớp này chịu trách nhiệm giao tiếp với thế giới bên ngoài: Database, File System, Email Provider, v.v. Nó phụ thuộc vào `Application` và `Core`.

* **Persistence/Context (`/Persistence/Context`)**: Chứa `MyDbContext.cs` là cầu nối với Entity Framework Core. Nơi đây sử dụng Fluent API (`OnModelCreating`) để cấu hình bảng, quan hệ (1-n, n-n) và các ràng buộc dữ liệu.
* **Persistence/Repositories (`/Persistence/Repositories`)**: Chứa các class thực thi truy xuất database.
  * `GenericRepository`: Triển khai `IGenericRepository` chứa các hàm CRUD cơ bản dùng chung (Add, Update, Delete, Find...).
  * `UnitOfWork`: Triển khai `IUnitOfWork`, đảm bảo tính toàn vẹn của Transaction khi lưu nhiều thay đổi cùng lúc (thông qua hàm `CompleteAsync()`).
* **Migrations (`/Migrations`)**: Chứa lịch sử thay đổi cấu trúc database do Entity Framework tạo ra.

### 4. SportConnect.API (Lớp Trình diễn / Presentation Layer)
Đây là điểm chạm (Entry Point) của Client. Lớp này tương tác trực tiếp với người dùng/ứng dụng thông qua HTTP. Nó tham chiếu đến `Application` và `Infrastructure`.

* **Controllers (`/Controllers`)**: Nơi nhận HTTP Request (GET, POST, PUT, DELETE), gọi các Service từ lớp Application, và trả về HTTP Response. (Ví dụ: `AuthController.cs` xử lý logic cho route `/api/auth/login`).
* **Program.cs**: Cấu hình khởi chạy ứng dụng (Pipeline). Nơi thiết lập Dependency Injection (DI) - đăng ký DbContext, UnitOfWork, Repositories, Services, cấu hình JWT Authentication và Swagger.
* **appsettings.json**: Lưu trữ các thông số cấu hình môi trường như `ConnectionStrings` (đường dẫn tới Database) và `JwtSettings` (Secret key, thời gian hết hạn...).

## Luồng hoạt động (End-to-End Flow)

Khi một Client (Mobile/Web) gọi một API, luồng dữ liệu sẽ đi qua các lớp như sau:

1. **API**: `Controller` nhận Request (chứa `DTO`), thực hiện validation cơ bản và chuyển DTO cho `Service`.
2. **Application**: `Service` thực thi logic nghiệp vụ (Kiểm tra điều kiện, tính toán giá, v.v.). Nó gọi tới `UnitOfWork` (thông qua Interface) để yêu cầu lấy hoặc lưu dữ liệu.
3. **Infrastructure**: `UnitOfWork` và `Repository` thực hiện các truy vấn SQL xuống Database qua `MyDbContext`.
4. **Core**: `Repository` ánh xạ dữ liệu từ DB thành các `Entities` và trả lại cho `Service`.
5. **Application**: `Service` biến đổi `Entities` thành kết quả (hoặc `DTO`) và trả lại cho `Controller`.
6. **API**: `Controller` gói kết quả lại thành HTTP Response (JSON, 200 OK) và gửi về Client.

## Tại sao chọn kiến trúc này?
* **Dễ test**: Do sử dụng Interface (`IAuthService`, `IUnitOfWork`), ta có thể dễ dàng mock data để viết Unit Test cho `Service` mà không cần gọi Database thật.
* **Bảo mật & Tránh rò rỉ**: Client chỉ nhìn thấy DTO, không bao giờ được chạm trực tiếp vào cấu trúc Entity thật của database.
* **Dễ mở rộng**: Khi muốn đổi Database (từ SQL Server sang PostgreSQL) hoặc đổi thư viện tạo Token, ta chỉ cần sửa ở lớp `Infrastructure` hoặc config mà không ảnh hưởng tới `Application` hay `Core`.
