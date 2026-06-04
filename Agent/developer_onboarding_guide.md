# SportConnect - Tài Liệu Hướng Dẫn Kỹ Thuật & Bàn Giao (Developer Onboarding Guide)

Chào mừng bạn đến với dự án **SportConnect**! Tài liệu này tổng hợp toàn bộ thông tin kiến trúc, tính năng, luồng hoạt động chính và hướng dẫn phát triển chi tiết nhằm giúp bạn nhanh chóng làm quen và có thể trực tiếp tham gia phát triển hệ thống.

---

## 1. Tổng Quan Hệ Thống

**SportConnect** là một nền tảng Web App PWA (Progressive Web App) kết nối trực tiếp **Chủ sân thể thao (Venue Owner)** và **Người chơi thể thao (Players)**.
* **Người chơi**: Tìm kiếm sân bãi theo vị trí địa lý, xem lịch trống, đặt lịch chơi, thanh toán online (VNPAY), và tạo/tham gia các kèo đấu ghép đội (Matchmaking).
* **Chủ sân**: Đăng ký cơ sở, cấu hình khung giờ hoạt động, biểu giá, quản lý lịch đặt sân và xem thống kê doanh thu.
* **Admin hệ thống**: Phê duyệt hồ sơ nâng cấp chủ sân, quản lý danh mục thể thao, giám sát người dùng và các cơ sở sân bãi.

### Công Nghệ Sử Dụng (Tech Stack)
* **Backend**: .NET Core 9, Entity Framework Core, SQL Server.
* **Frontend**: ReactJS, TypeScript, Vite, React Query (TanStack), Axios, Lucide Icons, Framer Motion (hiệu ứng chuyển trang).
* **Payment Gateway**: VNPAY Integration.
* **Map Services**: Google Maps JS SDK (Places API, Autocomplete, Marker).

---

## 2. Kiến Trúc Hệ Thống (System Architecture)

### 2.1. Phía Backend (Clean Architecture)
Mã nguồn Backend được tổ chức thành 4 phân lớp rõ rệt để đảm bảo tính độc lập và dễ kiểm thử:

```mermaid
graph TD
    API[SportConnect.API - Presentation] --> App[SportConnect.Application - Logic]
    App --> Core[SportConnect.Core - Domain Entities]
    Infra[SportConnect.Infrastructure - Database/External] --> App
    Infra --> Core
```

1. **SportConnect.Core (Domain Layer)**: 
   * Chứa các thực thể cơ sở dữ liệu (`User`, `Role`, `Venue`, `Court`, `Booking`, `Match`, `MatchPlayer`, `Notification`, v.v.).
   * Không phụ thuộc vào bất kỳ thư viện hay framework bên ngoài nào.
2. **SportConnect.Application (Application Layer)**:
   * Chứa các Interface dịch vụ (`IAdminService`, `IMatchService`, `IBookingService`), các DTOs truyền nhận dữ liệu, và logic nghiệp vụ chính của hệ thống.
3. **SportConnect.Infrastructure (Infrastructure Layer)**:
   * Hiện thực hóa kết nối Database (`MyDbContext`), triển khai cấu hình Entity Framework Fluent API.
   * Triển khai mẫu thiết kế **Generic Repository** và **Unit of Work** để quản lý giao dịch (transactions).
   * Triển khai các dịch vụ ngoài (VNPAY Library, Email Service).
4. **SportConnect.API (Presentation Layer)**:
   * Chứa các API Controllers (`AuthController`, `BookingController`, `MatchController`, `AdminController`).
   * Xử lý xác thực JWT (Token Validation) và phân quyền phân cấp bằng ASP.NET Core Identity/Roles.

### 2.2. Phía Frontend (React PWA)
Mã nguồn Frontend tổ chức trong thư mục `/Frontend/src` theo mô hình Component-Driven kết hợp React Query để quản lý state bất đồng bộ:

* **`/api`**: Cấu hình `axiosClient` tự động đính kèm JWT token từ localStorage vào header và xử lý lỗi tập trung.
* **`/components`**: Các component tái sử dụng (Layout, Form xác thực, Notification toàn cục).
* **`/hooks`**: 
  * `/queries`: Các query hook tải dữ liệu (sử dụng React Query) giúp tự động lưu bộ nhớ đệm (caching) và tự động làm mới.
  * `/mutations`: Các mutation hook gửi yêu cầu thay đổi dữ liệu (tạo sân, đặt lịch, duyệt yêu cầu).
* **`/pages`**: Các trang giao diện chính chia theo nhóm chức năng: `auth/`, `home/`, `owner/`, `admin/`, `profile/`.
* **`/services`**: Định nghĩa các hàm gọi API trực tiếp qua Axios.

---

## 2.3. Bản Đồ Chi Tiết Mã Nguồn & Nhiệm Vụ Từng File (Codebase & File Mapping)

Để hỗ trợ quá trình phát triển nhanh chóng, dưới đây là bảng mô tả chi tiết nhiệm vụ và nội dung mã nguồn của các tệp tin quan trọng trong dự án.

### 2.3.1. Phía Backend (.NET Core 9)

#### A. Dự án SportConnect.Core (Lớp Thực Thể - Domain Layer)
Chứa định nghĩa cấu trúc dữ liệu và các thực thể của hệ thống, ánh xạ trực tiếp xuống cơ sở dữ liệu SQL Server thông qua Entity Framework Core.

* **Thư mục `Entities/`**:
  * [User.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/User.cs): Định nghĩa thực thể Người dùng (User). Mở rộng thông tin từ ASP.NET Core Identity (Username, Email, Phone, PasswordHash, ngày tạo `CreatedAt`). Quản lý trạng thái khóa tài khoản và liên kết với các bảng Bookings, Matches.
  * [Role.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Role.cs): Định nghĩa các vai trò phân quyền trong hệ thống bao gồm `Default` (Người chơi), `Owner` (Chủ sân) và `Admin` (Quản trị viên).
  * [User_Role.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/User_Role.cs): Thực thể liên kết nhiều-nhiều (Many-to-Many Join Table) giữa Người dùng và Vai trò.
  * [OwnerProfile.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/OwnerProfile.cs): Chứa hồ sơ thông tin đăng ký làm chủ sân (Số CCCD, Mã số thuế/Giấy phép kinh doanh, Trạng thái phê duyệt `Pending/Approved/Rejected`, Lý do từ chối nếu có).
  * [Venue.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Venue.cs): Thực thể Cơ sở thể thao (Sân lớn). Chứa Tên sân, Địa chỉ chi tiết, Tỉnh/Thành phố, Kinh độ (`Longitude`), Vĩ độ (`Latitude`), Mô tả sân, Giờ mở/đóng cửa và Khóa ngoại liên kết tới chủ sân (`OwnerId`).
  * [Court.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Court.cs): Thực thể Sân đấu con (ví dụ: Sân bóng 5 người số 1, Sân Badminton số 2) nằm trong một Cơ sở thể thao (`VenueId`).
  * [Price.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Price.cs): Định nghĩa bảng giá dịch vụ sân. Quản lý mức giá khác nhau dựa trên khung giờ (Giờ cao điểm/Thường) và ngày trong tuần.
  * [Booking.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Booking.cs): Quản lý thông tin đặt lịch. Ghi nhận `CourtId` đặt, `UserId` đặt, Ngày chơi, Giờ bắt đầu/Kết thúc, Tổng tiền, Trạng thái đặt (`Pending, Paid, Cancelled, Completed`), mã giao dịch ngân hàng và thông tin VNPAY.
  * [Match.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Match.cs): Thực thể Kèo đấu ghép đội. Gắn liền với một lịch đặt sân (`BookingId`), ghi nhận thông tin môn thể thao, trình độ yêu cầu (Yếu/Trung bình/Khá), số lượng người chơi cần tuyển (`MaxPlayers`), số người đã tham gia, trạng thái (`OPEN, FULL, CANCELLED`).
  * [MatchPlayer.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/MatchPlayer.cs): Thực thể liên kết giữa Người chơi và Kèo đấu, lưu trạng thái yêu cầu gia nhập (`Pending` chờ duyệt, `Approved` đã tham gia, `Rejected` bị từ chối).
  * [Review.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Review.cs): Lưu trữ điểm đánh giá (Rating từ 1-5 sao) và bình luận phản hồi của người chơi đối với cơ sở sân bãi.
  * [SportCategory.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/SportCategory.cs): Danh mục các môn thể thao hệ thống hỗ trợ (Bóng đá, Cầu lông, Tennis, Bóng rổ).
  * [Notification.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Notification.cs): Thực thể lưu trữ tin nhắn thông báo đẩy cho người dùng (Thông báo đặt sân thành công, có người xin gia nhập kèo đấu, v.v.).
  * [FavoriteVenue.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/FavoriteVenue.cs): Lưu danh sách các cơ sở sân bóng yêu thích của từng người chơi.
  * [Staff.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Staff.cs) & [Staff_Code.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Core/Entities/Staff_Code.cs): Quản lý thông tin nhân viên hỗ trợ sân và mã xác thực phân quyền quản lý nội bộ.

#### B. Dự án SportConnect.Application (Lớp Nghiệp Vụ - Application Layer)
Đóng vai trò trung gian xử lý logic nghiệp vụ, khai báo các giao thức (Interfaces) và cấu trúc truyền nhận dữ liệu (DTOs).

* **Thư mục `Interfaces/`**: Khai báo các giao diện dịch vụ (ví dụ: `IAuthService`, `IBookingService`, `IMatchService`, `IAdminService`). Giúp đảm bảo tính lỏng lẻo (loose coupling) phục vụ viết Unit Test.
* **Thư mục `DTOs/`**: Các class chứa dữ liệu đầu vào/đầu ra cho API, loại bỏ các trường không cần thiết hoặc nhạy cảm của Entity gốc trước khi gửi đi.
* **Thư mục `Services/` (Thực thi logic nghiệp vụ)**:
  * [AuthService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/AuthService.cs): Xử lý đăng ký, đăng nhập tài khoản thường và Google OAuth. Thực hiện mã hóa mật khẩu, kiểm tra quyền hạn và phát hành JWT Token (hạn dùng, claims).
  * [BookingService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/BookingService.cs): Kiểm tra xung đột lịch đặt sân (Double Booking) bằng thuật toán so khớp khoảng thời gian. Tính toán tổng tiền dựa trên cấu hình giá giờ cao điểm. Cập nhật trạng thái đặt sân sau khi nhận kết quả thanh toán từ VNPAY.
  * [MatchService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/MatchService.cs): Logic tạo kèo ghép đội từ lịch đặt sân đã thanh toán. Kiểm tra số lượng người, logic xin tham gia, phê duyệt/từ chối thành viên của Host, xử lý tự động chuyển trạng thái `OPEN` <-> `FULL` khi thành viên tham gia hoặc rời kèo.
  * [OwnerOnboardingService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/OwnerOnboardingService.cs): Xử lý hồ sơ xin nâng cấp tài khoản lên Chủ sân, kiểm tra tính hợp lệ của giấy tờ kinh doanh trước khi gửi lên cho Admin duyệt.
  * [OwnerVenueService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/OwnerVenueService.cs): Cung cấp các chức năng cho chủ sân: Tạo mới cơ sở sân, cấu hình sơ đồ sân con, định nghĩa biểu giá, xem danh sách lịch đặt sân tại cơ sở và truy vấn dữ liệu báo cáo thống kê doanh thu theo thời gian.
  * [PublicVenueService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/PublicVenueService.cs): Hỗ trợ người dùng tìm kiếm sân công khai, lọc sân theo bộ lọc tỉnh thành, quận huyện, khoảng cách địa lý (tính bằng công thức toán học bán kính GPS) và môn thể thao.
  * [ReviewService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/ReviewService.cs): Tiếp nhận đánh giá phản hồi từ người chơi, tính toán lại điểm đánh giá trung bình (Average Rating) của cơ sở sân bóng.
  * [AdminService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/AdminService.cs): Các nghiệp vụ đặc quyền của quản trị viên: Phê duyệt hồ sơ đăng ký chủ sân, khóa/mở khóa tài khoản người dùng vi phạm, quản trị danh mục các môn thể thao.

#### C. Dự án SportConnect.Infrastructure (Lớp Hạ Tầng - Infrastructure Layer)
Tương tác trực tiếp với cơ sở dữ liệu và các API/dịch vụ của bên thứ ba.

* **Thư mục `Persistence/Context/MyDbContext.cs`**:
  * Cấu hình kết nối SQL Server, khai báo các bảng dữ liệu `DbSet<T>`.
  * Cấu hình ràng buộc dữ liệu Fluent API (khóa ngoại, chỉ mục index, hành vi xóa Cascade Delete).
* **Thư mục `Persistence/Repositories/`**:
  * [GenericRepository.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Infrastructure/Persistence/Repositories/GenericRepository.cs): Lớp dùng chung triển khai các truy vấn SQL cơ bản (Thêm, Xóa, Sửa, Lấy theo ID, Lấy danh sách kèm phân trang) cho tất cả thực thể mà không cần viết lại mã SQL/EF Core.
  * [UnitOfWork.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Infrastructure/Persistence/Repositories/UnitOfWork.cs): Đảm bảo tính toàn vẹn dữ liệu (Transaction) khi thực hiện nhiều lệnh ghi cơ sở dữ liệu đồng thời. Nếu một lệnh lỗi, toàn bộ giao dịch sẽ được Rollback lại.
  * [AdminRepository.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Infrastructure/Persistence/Repositories/AdminRepository.cs): Triển khai các câu truy vấn phức tạp phục vụ thống kê tổng thể của Admin hệ thống.
* **Thư mục `Services/`**:
  * [VnPayLibrary.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Infrastructure/Services/VnPayLibrary.cs): Thư viện mã hóa hỗ trợ sắp xếp các tham số thanh toán theo thứ tự Alphabet và thực hiện băm bảo mật HMAC-SHA512 để tạo chữ ký giao dịch.
  * [VnPayService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Infrastructure/Services/VnPayService.cs): Xây dựng URL thanh toán để điều hướng người dùng sang cổng giao dịch VNPAY và kiểm tra tính hợp lệ của chữ ký phản hồi.
  * [NotificationService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Infrastructure/Services/NotificationService.cs): Xử lý lưu trữ thông báo vào database và định tuyến gửi thông báo thời gian thực.

#### D. Dự án SportConnect.API (Lớp Giao Tiếp - Presentation Layer)
Nơi tiếp nhận các yêu cầu HTTP Request từ Frontend, kiểm tra quyền truy cập và chuyển tiếp xử lý.

* **Thư mục `Controllers/`**:
  * [AuthController.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.API/Controllers/AuthController.cs): API Đăng nhập, đăng ký, đăng nhập bằng Google, làm mới token.
  * [BookingController.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.API/Controllers/BookingController.cs): API tạo yêu cầu đặt sân, kiểm tra khung giờ trống, xem lịch sử đặt sân của cá nhân.
  * [PaymentController.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.API/Controllers/PaymentController.cs): API tiếp nhận phản hồi từ cổng thanh toán VNPAY (IPN Endpoint), đảm bảo giao dịch được cập nhật chính xác dù người dùng có tắt trình duyệt.
  * [MatchController.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.API/Controllers/MatchController.cs): API tạo kèo ghép, yêu cầu gia nhập, phê duyệt thành viên, hủy kèo và rời kèo đấu.
  * [OwnerVenueController.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.API/Controllers/OwnerVenueController.cs): API cấu hình sân con, lịch hoạt động và biểu đồ báo cáo doanh thu của chủ sân.
  * [AdminController.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.API/Controllers/AdminController.cs): API quản trị người dùng, duyệt hồ sơ nâng cấp chủ sân và quản lý danh mục hệ thống.

---

### 2.3.2. Phía Frontend (React PWA)

Toàn bộ giao diện và luồng xử lý phía người dùng nằm trong `/Frontend/src`.

#### A. Cấu Hình & Cài Đặt Gốc
* [main.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/main.tsx): Tệp tin gốc khởi chạy ứng dụng. Thiết lập React Query `QueryClientProvider` để quản lý bộ nhớ đệm dữ liệu API, nạp tệp CSS chung `index.css` và khởi chạy bộ định tuyến ứng dụng.
* [App.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/App.tsx): Định nghĩa toàn bộ cây đường dẫn (Routes) của ứng dụng. Bao quanh các trang bằng các lớp bảo vệ phân quyền phù hợp (`AuthGuard`, `OwnerGuard`, `AdminGuard`).
* [admin.css](file:///d:/IT/HK2_Y4/DATN/Frontend/src/admin.css): Chứa toàn bộ định dạng CSS giao diện máy tính dành riêng cho trang quản trị hệ thống (Admin Dashboard). Chỉ được nạp khi truy cập vào không gian Admin.
* [index.css](file:///d:/IT/HK2_Y4/DATN/Frontend/src/index.css): Chứa định dạng CSS cốt lõi của PWA cho người dùng di động và chủ sân, được nạp ngay từ đầu để đảm bảo tốc độ hiển thị nhanh nhất.
* [api/axiosClient.ts](file:///d:/IT/HK2_Y4/DATN/Frontend/src/api/axiosClient.ts): Định nghĩa instance gọi API bằng thư viện Axios. Cấu hình tự động lấy JWT token từ LocalStorage chèn vào header `Authorization: Bearer <token>` trước khi gửi lên Backend, đồng thời bắt các lỗi HTTP 401 để tự động đăng xuất người dùng nếu token hết hạn.

#### B. Các Nhóm Trang Giao Diện (`pages/`)
Được chia nhóm thư mục rõ ràng theo quyền hạn và mục đích sử dụng:

* **Trang Xác Thực (`pages/auth/`)**:
  * [LoginPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/auth/LoginPage.tsx) / [RegisterPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/auth/RegisterPage.tsx): Form nhập liệu đăng nhập/đăng ký người dùng thường, hỗ trợ tích hợp nút đăng nhập nhanh bằng tài khoản Google.
  * [ForgotPasswordPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/auth/ForgotPasswordPage.tsx): Trang hỗ trợ lấy lại mật khẩu thông qua địa chỉ email đã đăng ký.
  * [AuthGuard.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/auth/AuthGuard.tsx): Thành phần kiểm tra token bảo mật. Nếu chưa đăng nhập, tự động chuyển hướng người dùng về trang đăng nhập.

* **Trang Người Dùng - PWA (`pages/home/` & `pages/profile/`)**:
  * [HomePage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/home/HomePage.tsx): Trang chủ ứng dụng PWA, chứa banner chào mừng, tìm kiếm nhanh sân bóng và danh sách các môn thể thao nổi bật.
  * [ExplorePage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/home/ExplorePage.tsx): Trang tìm kiếm chính. Cho phép tìm sân bóng gần vị trí hiện tại của thiết bị (sử dụng GPS API), lọc sân theo môn thể thao, hiển thị danh sách sân bóng kèm hình ảnh trực quan.
  * [MapPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/home/MapPage.tsx): Tích hợp Google Maps JS SDK hiển thị bản đồ trực quan. Vẽ các ghim (Marker) vị trí sân bóng xung quanh người dùng, hỗ trợ công cụ kéo thả bán kính tìm kiếm (Radius Slider).
  * [VenueDetailPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/home/VenueDetailPage.tsx): Hiển thị chi tiết sân bóng, danh sách các sân đấu con, nhận xét đánh giá từ cộng đồng, và đặc biệt là bảng chọn khung giờ trống trực quan để đặt lịch trực tuyến.
  * [PaymentResultPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/home/PaymentResultPage.tsx): Trang đích hiển thị kết quả sau khi thanh toán từ VNPAY (Thành công/Thất bại), hướng dẫn người chơi bước tiếp theo.
  * [MatchListPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/home/MatchListPage.tsx) & [MatchDetailPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/home/MatchDetailPage.tsx): Giao diện mạng xã hội tìm đối chơi thể thao. Hiển thị bảng tin các kèo bóng đang thiếu người, cho phép gửi yêu cầu gia nhập và trò chuyện/xem thông tin các người chơi cùng trận.
  * [ProfilePage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/profile/ProfilePage.tsx) & [MyBookingsPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/profile/MyBookingsPage.tsx): Quản lý thông tin tài khoản cá nhân và theo dõi lịch sử các lần đặt sân của người chơi kèm mã QR vé vào sân để check-in tại quầy.

* **Trang Chủ Sân (`pages/owner/`)**:
  * [OwnerGuard.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/owner/OwnerGuard.tsx): Kiểm định quyền hạn. Chỉ cho phép các tài khoản có vai trò `Owner` đi qua.
  * [OwnerOnboardingFlow.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/owner/OwnerOnboardingFlow.tsx): Quy trình đăng ký chủ sân nhiều bước (nhập hồ sơ pháp lý, chọn địa chỉ sân bóng qua gợi ý Google Places và ghim vị trí chính xác trên bản đồ số).
  * [OwnerDashboardPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/owner/OwnerDashboardPage.tsx): Trang quản trị doanh thu của chủ sân với biểu đồ đường/cột thể hiện lượng đặt sân và dòng tiền thu về theo ngày/tháng/năm.
  * [VenueConfigPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/owner/VenueConfigPage.tsx): Cung cấp giao diện thiết lập thông số sân: thêm bớt sân con, thiết lập khung giờ mở cửa, cài đặt bảng giá theo giờ cao điểm và tạo các lịch hoạt động định kỳ.

* **Trang Admin Hệ Thống (`pages/admin/`)**:
  * [AdminGuard.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/admin/AdminGuard.tsx): Bảo vệ không gian làm việc của Admin.
  * [AdminLayout.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/admin/AdminLayout.tsx): Khung bố cục (Layout) với menu điều hướng bên trái (Sidebar) thích ứng với màn hình lớn.
  * [AdminOwnerRequestsPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/admin/AdminOwnerRequestsPage.tsx): Danh sách các yêu cầu đăng ký làm chủ sân đang chờ duyệt. Admin có thể xem tài liệu đính kèm và ấn nút Duyệt hoặc Từ chối kèm lý do từ chối.
  * [AdminUsersPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/admin/AdminUsersPage.tsx) & [AdminVenuesPage.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/admin/AdminVenuesPage.tsx): Các bảng quản trị toàn bộ tài khoản người dùng và cơ sở thể thao trên hệ thống, cho phép khóa/mở khóa tài khoản hoặc hủy tư cách sân bãi vi phạm.

---

## 3. Các Luồng Nghiệp Vụ Cốt Lõi (Core Workflows)

### 3.1. Luồng Xác Thực & Phân Quyền (Authentication & RBAC)
Hệ thống sử dụng cơ chế JWT Token để xác thực người dùng. Quyền hạn được chia làm 3 nhóm chính: `Default` (Người chơi), `Owner` (Chủ sân) và `Admin` (Quản trị viên).

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant API as AuthController
    participant DB as SQL Server

    User->>API: Gửi Username/Password hoặc OAuth Google
    API->>DB: Kiểm tra tài khoản & Roles
    DB-->>API: Trả về thông tin hợp lệ
    API-->>User: Trả về JWT Token (chứa Claim NameID & Roles)
    Note over User: Lưu Token vào LocalStorage
```

* **Frontend Route Guards**:
  * [AuthGuard.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/auth/AuthGuard.tsx): Bảo vệ các trang cá nhân của người chơi (Settings, Profile).
  * [OwnerGuard.tsx](file:///d:/IT/HK2_Y4/DATN/Frontend/src/pages/owner/OwnerGuard.tsx): Chỉ cho phép người dùng có Role `Owner` vào trang quản lý sân bãi và lịch đặt.
  * [AdminGuard.tsx](file:///d:/IT/HK2_Y4/DATN/pages/admin/AdminGuard.tsx): Chỉ bảo vệ các tuyến đường `/admin/*` dành riêng cho quản trị viên tối cao.

---

### 3.2. Luồng Đặt Sân & Thanh Toán VNPAY (Booking & Payment Gateway)
Đây là luồng nghiệp vụ phức tạp nhất, đảm bảo tính nhất quán dữ liệu tránh trường hợp hai người đặt trùng một khung giờ chơi (Double Booking).

```mermaid
sequenceDiagram
    participant User as Người chơi
    participant FE as Frontend App
    participant BE as Backend API
    participant VNP as VNPAY Gateway

    User->>FE: Chọn Sân -> Chọn Khung giờ trống -> Thanh toán
    FE->>BE: Gửi lệnh Tạo Booking (Pending)
    BE->>BE: Kiểm tra trùng lịch (Lock Slot)
    BE->>BE: Tạo URL thanh toán VNPAY (chứa mã băm chữ ký SHA512)
    BE-->>FE: Trả về URL thanh toán VNPAY
    FE->>VNP: Chuyển hướng người dùng sang VNPAY
    User->>VNP: Nhập thông tin thẻ/ứng dụng ngân hàng & xác nhận
    VNP-->>BE: Gọi IPN callback để kiểm tra chữ ký & cập nhật trạng thái đặt sân
    VNP-->>FE: Chuyển hướng về trang kết quả (/payment-result)
    FE->>BE: Kiểm tra trạng thái cuối cùng
    FE-->>User: Hiển thị Đặt sân thành công!
```

> [!IMPORTANT]
> **Xử lý chữ ký bảo mật VNPAY**: Backend thực hiện thuật toán băm HMAC-SHA512 với `HashSecret` để tạo mã bảo mật. Khi nhận dữ liệu phản hồi từ VNPAY, Backend phải sắp xếp tham số theo bảng chữ cái và tạo lại mã băm để so khớp trước khi cập nhật cơ sở dữ liệu nhằm phòng chống giả mạo giao dịch.

---

### 3.3. Luồng Tìm Đối & Ghép Đội (Matchmaking Flow)
Cho phép người chơi sau khi đặt sân thành công có thể chia sẻ sân lên bảng tin chung để rủ thêm người chơi ghép đội, chia sẻ chi phí sân.

* **Trạng thái Kèo đấu (Match Status)**:
  * `OPEN`: Kèo đấu đang tuyển thêm người chơi.
  * `FULL`: Trận đấu đã đủ số lượng thành viên tối đa đặt ra.
  * `COMPLETED`: Trận đấu đã diễn ra thành công.
  * `CANCELLED`: Kèo đấu đã bị Host hủy bỏ.

```mermaid
flowchart TD
    A[Đặt Sân Thành Công] --> B[Host Tạo Kèo Đấu từ Booking]
    B --> C[Trạng thái Kèo: OPEN]
    D[Người chơi khác] -->|Nhấn Join| E[Trạng thái Yêu Cầu: PENDING]
    E --> F{Host phê duyệt?}
    F -->|Đồng ý| G[Cập nhật: APPROVED]
    F -->|Từ chối| H[Cập nhật: REJECTED]
    G --> I{Đủ MaxPlayers?}
    I -->|Đúng| J[Trạng thái Kèo: FULL]
    I -->|Chưa đủ| C
    
    G -->|Thành viên rời kèo| K[Rời Trận: Xóa người chơi]
    K -->|Nếu Kèo đang FULL| C
    
    B -->|Host Hủy Kèo| L[Trạng thái Kèo: CANCELLED]
    L --> M[Từ chối tất cả thành viên liên quan]
```

* **Các API mới triển khai liên quan**:
  * `RejectJoin` (`PUT /api/matches/{id}/reject/{userId}`): Cho phép Host từ chối thành viên gửi yêu cầu.
  * `LeaveMatch` (`POST /api/matches/{id}/leave`): Cho phép thành viên tự rời kèo đấu, tự động mở lại trạng thái `OPEN` cho kèo đấu nếu trước đó kèo bị chuyển sang `FULL`.
  * `CancelMatch` (`DELETE /api/matches/{id}`): Cho phép Host hủy toàn bộ kèo đấu bất kỳ lúc nào trước giờ đấu.
  * `UpdateAttendance` (`PUT /api/matches/{id}/attendance/{userId}?status=...`): Cho phép Host điểm danh thành viên đã duyệt tham gia (Các trạng thái: `ATTENDED` - đã đến, `NO_SHOW` - vắng mặt, `APPROVED` - đã duyệt nhưng chưa điểm danh).

---

### 3.4. Luồng Đăng Ký Chủ Sân & Định Vị Bản Đồ
Luồng giúp chuyển dịch người dùng từ người chơi (`Default`) lên vai trò chủ doanh nghiệp (`Owner`).

1. **Khối Hành Chính Địa Phương Offline**:
   * Hệ thống tích hợp bộ dữ liệu tỉnh thành Việt Nam thông qua file JSON cục bộ (`vietnam_units.json`) phẳng hóa cấp 2 để phục vụ việc tìm kiếm phân loại sân theo Quận/Huyện/Thành phố thuộc tỉnh (Xử lý mượt mà các trường hợp thành lập Thành phố thuộc Thành phố như TP. Thủ Đức).
2. **Định Vị Google Maps Chính Xác Tuyệt Đối**:
   * **Google Places Autocomplete**: Người dùng nhập tên/địa chỉ sân, Google Maps gợi ý tự động địa điểm thực tế trên bản đồ. Khi được chọn, trả về vĩ độ (`latitude`) và kinh độ (`longitude`) chính xác.
   * **Draggable Map Marker**: Hiển thị bản đồ nhỏ, cho phép chủ sân di chuyển ghim (Marker) để chỉ định chính xác lối vào sân bóng của mình trên Google Maps, giúp người chơi định vị chính xác khi di chuyển.

---

## 4. Các Biện Pháp Tối Ưu Bảo Mật Hệ Thống (System Security Hardening)

Để bảo vệ tài nguyên và thông tin cá nhân của người dùng, hệ thống SportConnect áp dụng nhiều giải pháp bảo mật ở cả tầng cơ sở dữ liệu, logic nghiệp vụ ứng dụng và giao tiếp client-server.

### 4.1. Xác Thực & Phân Quyền Phân Cấp Nghiêm Ngặt (Hierarchical RBAC)
* **Backend Role-based Authorization**: Tích hợp chặt chẽ ASP.NET Core Identity và JWT Bearer Authentication. Các API đầu cuối (Endpoints) nhạy cảm được cấu hình thuộc tính `[Authorize(Roles = "Admin")]` hoặc `[Authorize(Roles = "Owner")]` nhằm ngăn chặn các hành vi truy cập trái phép bằng cách gửi request trực tiếp từ Postman hoặc API clients.
* **Frontend Route Guards**: Sử dụng hệ thống Route Guard tùy biến trong React gồm `AuthGuard.tsx`, `OwnerGuard.tsx`, và `AdminGuard.tsx`. Hệ thống kiểm soát JWT token trong LocalStorage trước khi cho phép trình duyệt dựng (render) giao diện của các trang nhạy cảm, ngăn chặn tấn công thăm dò giao diện (UI probing).

### 4.2. Cơ Chế Chống Giả Mạo Giao Dịch VNPAY
* **Chữ Ký Số Bảo Mật HMAC-SHA512**: Khi khởi tạo giao dịch hoặc tiếp nhận phản hồi từ IPN webhook của VNPAY, Backend thực hiện việc sắp xếp các khoá tham số theo bảng chữ cái (Alphabetical Order), sau đó sử dụng thuật toán băm HMAC-SHA512 kết hợp với khoá bí mật `HashSecret` được cấu hình an toàn trên server để so khớp tính toàn vẹn của gói tin.
* **Đối Soát Trực Tiếp Với VnPay Server**: Thay vì chỉ tin cậy vào gói tin phản hồi của trình duyệt, phía Backend định kỳ thực hiện việc gọi API đối soát trực tiếp với VnPay Gateway để truy vấn trạng thái thực tế của giao dịch nhằm ngăn ngừa tuyệt đối các cuộc tấn công thay đổi giá trị số tiền hoặc thay đổi trạng thái giao dịch giả từ Client.

### 4.3. Phòng Tránh Double Booking (Trùng Lịch Đặt Sân)
* **Khoá Đặt Sân Tạm Thời (Slot Locking Mechanism)**: Triển khai kiểm tra xung đột khung giờ đặt sân bằng thuật toán so khớp thời gian (Time overlap checking) ngay từ thời điểm tạo đơn hàng (đơn hàng ở trạng thái `Pending`).
* Khung giờ này sẽ bị khoá tạm thời trong 15 phút. Nếu người chơi thanh toán thành công (VNPAY phản hồi mã thành công), trạng thái cập nhật thành `Paid`. Nếu quá 15 phút không nhận được thanh toán, hệ thống tự động giải phóng khung giờ chơi để người khác đặt.

### 4.4. Tránh Rò Rỉ Dữ Liệu & Tấn Công SQL Injection
* **Data Transfer Objects (DTOs)**: Tuyệt đối không trả về trực tiếp các thực thể EF Core Database gốc ra ngoài API. Toàn bộ dữ liệu được bao bọc thông qua các lớp DTOs để giấu các thông tin nhạy cảm như `PasswordHash`, mã kích hoạt `StaffCode`, hay chữ ký kiểm tra của hệ thống.
* **Chống SQL Injection**: Toàn bộ câu lệnh truy vấn dữ liệu từ Backend xuống SQL Server được viết bằng LINQ / Entity Framework Core. EF Core tự động biên dịch thành các truy vấn có tham số hóa (Parameterized Queries) tại database, triệt tiêu hoàn toàn nguy cơ chèn mã độc SQL (SQL Injection).

---

## 5. Các Giải Pháp Tối Ưu UI/UX (UI/UX Optimizations)

Giao diện ứng dụng SportConnect được thiết kế mượt mà, tối ưu thời gian phản hồi và đem lại trải nghiệm thân thiện nhất cho cả người chơi (PWA trên di động) và quản trị viên (Desktop).

### 5.1. Tải Tài Nguyên Theo Nhu Cầu & Tách Biệt Stylesheet
* **Lazy Loading CSS**: Phân tách hoàn toàn tệp CSS của ứng dụng PWA trên di động (`index.css` ~37KB) khỏi giao diện quản trị Admin trên máy tính (`admin.css` ~18KB). Tệp `admin.css` chỉ được import động khi người dùng đăng nhập tài khoản Admin và chuyển hướng sang trang quản trị `/admin`, giúp giảm tải dung lượng tải ban đầu cho người chơi dùng mạng di động.
* **React Dynamic Imports (Code Splitting)**: Kết hợp định tuyến `react-router-dom` và `React.lazy` để đóng gói các trang thành các tệp Javascript (Chunks) riêng biệt. Người dùng truy cập trang nào thì trình duyệt mới tải code của trang đó.

### 5.2. Caching Thông Minh Với React Query (TanStack Query)
* **Stale-While-Revalidate**: Áp dụng cho các truy vấn lấy danh sách sân bóng (`useVenues`), lịch đặt sân cá nhân (`useBookings`), và kèo ghép đội (`useMatches`). Khi người chơi chuyển trang và quay lại, giao diện hiển thị ngay lập tức dữ liệu cũ từ cache (thời gian tải = 0ms), đồng thời ngầm gửi request cập nhật dữ liệu mới từ server để cập nhật lại UI nếu có thay đổi.
* **Tự Động Làm Mới Cache (Query Invalidation)**: Khi người dùng thao tác thay đổi trạng thái (ví dụ: Huỷ đặt sân, tạo trận mới, duyệt thành viên), React Query sẽ tự động vô hiệu hoá bộ đệm của danh sách liên quan và kích hoạt tải lại dữ liệu tức thì, giúp giao diện luôn cập nhật thời gian thực.

### 5.3. Trải Nghiệm Bản Đồ & Định Vị Vị Trí Bản Xứ
* **Google Places Autocomplete**: Nhập địa chỉ với cơ chế tự động gợi ý địa điểm chính xác từ Google, giảm thiểu thao tác gõ bàn phím của người dùng.
* **Draggable Marker UX**: Cho phép chủ sân kéo thả ghim vị trí (Marker) trực tiếp trên bản đồ số để xác định chính xác lối vào sân bóng của cơ sở, khắc phục lỗi sai số định vị của Google Maps đối với các địa chỉ trong ngõ hẻm.
* **Công Thức Tính Bán Kính GPS**: Tích hợp công thức toán học tính khoảng cách địa lý (Haversine/Spherical Geometry) trực tiếp tại client để hiển thị khoảng cách di chuyển thực tế từ vị trí người dùng đến từng sân bóng trên giao diện tìm kiếm.

### 5.4. Hiệu Ứng Chuyển Động & Trạng Thái Chờ Mượt Mà
* **Framer Motion Transitions**: Cấu hình hiệu ứng mượt mà (Fade-in, slide-up) khi chuyển đổi giữa các tab, trang, hoặc bật các hộp thoại (Modal popup), mang lại trải nghiệm giống ứng dụng bản xứ (Native App) trên iOS/Android.
* **Micro-Animations**: Thiết lập các phản hồi chuyển động nhỏ (Scale 102%, đổ bóng nhẹ) khi hover hoặc chạm tay vào các thẻ Sân bóng, nút bấm, giúp giao diện có phản hồi trực quan sinh động.
* **Skeleton Loading & Loading Overlay**: Hiển thị các khung xương xám (Skeleton Screens) mô phỏng cấu trúc nội dung đang tải để tránh cảm giác chờ đợi của người dùng, kết hợp spinner hoạt hình xoay tròn mỗi khi hệ thống xử lý tác vụ ngầm.

---

## 6. Hướng Dẫn Dành Cho Nhà Phát Triển Mới (Intern)

### 6.1. Cách Chạy Dự Án Dưới Local

#### Yêu cầu môi trường (Prerequisites):
* .NET SDK 9.0
* SQL Server LocalDB hoặc Docker SQL Server Express
* Node.js v18 trở lên

#### Khởi chạy Backend (.NET Core 9):
1. Mở terminal tại thư mục `/Backend`.
2. Kiểm tra chuỗi kết nối trong `appsettings.json` tại dự án `SportConnect.API`.
3. Chạy lệnh:
   ```bash
   dotnet restore
   dotnet build
   dotnet run --project SportConnect.API
   ```
4. Truy cập Swagger UI tại: `http://localhost:5254/swagger/index.html` để kiểm tra các API hoạt động.

#### Khởi chạy Frontend (ReactJS):
1. Mở terminal tại thư mục `/Frontend`.
2. Chạy lệnh cài đặt thư viện:
   ```bash
   npm install
   ```
3. Khởi chạy dev server:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt truy cập `http://localhost:5173`.

---

### 6.2. Các Mẫu Thiết Kế Thường Gặp & Cách Bổ Sung Tính Năng Mới

#### Mẫu 1: Cách Thêm Một API Mới Ở Backend
1. **Core**: Định nghĩa thực thể Entity mới (nếu cần) và đăng ký DbSet trong `MyDbContext.cs`.
2. **Application**:
   * Định nghĩa DTOs trong thư mục `DTOs/`.
   * Định nghĩa interface nghiệp vụ trong `Interfaces/` (ví dụ: `IReviewService.cs`).
   * Hiện thực hóa logic nghiệp vụ tại lớp Service tương ứng trong `Services/`.
3. **API**: 
   * Tạo Controller mới thừa kế `ControllerBase`.
   * Đăng ký các Endpoint với các attribute định tuyến (`[HttpGet]`, `[HttpPost]`, `[Authorize]`).
4. **Dependency Injection**: Khai báo đăng ký dịch vụ trong `Program.cs` (Ví dụ: `builder.Services.AddScoped<IReviewService, ReviewService>();`).

#### Mẫu 2: Cách Gọi API Và Cập Nhật UI Ở Frontend (React Query)
1. Thêm hàm gọi API trong file service tương ứng tại `/Frontend/src/services` (ví dụ: `matchService.ts`).
2. Khai báo Hook React Query:
   * Nếu là tải dữ liệu: Viết hook `useQuery` trong `/queries`.
   * Nếu là chỉnh sửa dữ liệu: Viết hook `useMutation` trong `/mutations`. Đừng quên gọi `queryClient.invalidateQueries` tại `onSuccess` để tự động cập nhật dữ liệu mới lên UI.
3. Import hook vào Component và sử dụng state `isLoading`, `data` hoặc hàm kích hoạt `mutateAsync` để xây dựng giao diện.
