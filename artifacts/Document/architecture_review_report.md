# Báo Cáo Đánh Giá Kiến Trúc & Codebase (Architectural & Codebase Review) - SportConnect

> **Người thực hiện:** Senior Developer / Software Architect
> **Dự án:** SportConnect (Web App & PWA)
> **Mục tiêu:** Đánh giá hiện trạng hệ thống, chỉ ra điểm tốt/chưa tốt, đề xuất tái cấu trúc (refactoring) để chuẩn bị cho môi trường Production, và thiết lập lộ trình phát triển tính năng tiếp theo.

---

## 1. Đánh Giá Kiến Trúc Tổng Quan (System Architecture)

Hệ thống được thiết kế theo mô hình kiến trúc hiện đại, phân tách rõ ràng trách nhiệm giữa Backend và Frontend:
* **Backend:** Phát triển trên nền tảng **ASP.NET Core 8**, áp dụng mô hình **Clean Architecture** (Core, Application, Infrastructure, API) kết hợp **Repository Pattern** và **Unit of Work**. Đây là lựa chọn phù hợp cho một dự án cần khả năng mở rộng (scalability) và dễ viết unit test.
* **Frontend:** Viết bằng **React 19 + TypeScript + Vite**, quản lý state và bất đồng bộ bằng **TanStack Query v5 (React Query)** và styling bằng **Vanilla CSS** định hướng Mobile-first (giao diện tối ưu hóa cho PWA di động, giới hạn khung hiển thị 480px trên Desktop).

---

## 2. Những Điểm Đã Làm Tốt (Strengths)

Qua review chi tiết codebase, hệ thống có nhiều điểm sáng đáng ghi nhận:

### A. Thiết kế cấu trúc dự án chuẩn mực
* **Phân lớp (Separation of Concerns):** Phân chia rõ ràng giữa Domain Entities (`SportConnect.Core`), Business Logic (`SportConnect.Application`), Giao tiếp bên ngoài (`SportConnect.Infrastructure`), và Endpoints (`SportConnect.API`).
* **Sử dụng DTOs hợp lý:** Không có hiện tượng rò rỉ (leak) trực tiếp Entity Database ra Client. Tất cả dữ liệu nhận vào và trả ra đều đi qua các DTO chuyên biệt.

### B. Tư duy State Management ở Frontend rất tốt
* **TanStack Query (React Query v5):** Việc bóc tách toàn bộ logic gọi API, quản lý cache, loading state thành các custom hook (`queries`, `mutations`) và quản lý tập trung các `queryKeys` là điểm cộng lớn. Điều này giúp code giao diện (UI Components) cực kỳ sạch sẽ, chỉ tập trung vào render UI.
* **Sử dụng invalidateQueries chính xác:** Sau khi Admin duyệt/từ chối yêu cầu chủ sân, hệ thống tự động làm mới cache giúp giao diện cập nhật ngay lập tức mà không cần reload trang.

### C. Xử lý nghiệp vụ (Business Logic) vững chắc
* **Chống đặt trùng sân (Double-booking Prevention):** Trong `BookingService.cs`, logic kiểm tra khoảng thời gian giao nhau áp dụng công thức: `StartA < EndB && EndA > StartB`. Đây là cách kiểm tra chuẩn và tối ưu nhất để tránh xung đột thời gian.
* **Cơ chế tính giá linh hoạt:** `BookingService` chia nhỏ khoảng thời gian thành các block 30 phút để tính tiền dựa trên các `PriceRule`. Quy tắc sắp xếp rules theo độ dài thời gian (`OrderBy(r => r.EndHour - r.StartHour)`) đảm bảo các khung giờ cụ thể (ví dụ: Giờ vàng) sẽ ghi đè chính xác lên khung giờ chung (All-day).
* **Save Draft khi Đăng ký Chủ Sân:** Hỗ trợ Multi-step onboarding có lưu bản nháp (`DraftData` dưới dạng JSON trong DB) rất thân thiện với người dùng, phòng trường hợp tiến trình đăng ký bị gián đoạn.

---

## 3. Những Điểm Chưa Tốt & Đề Xuất Cải Tiến (Weaknesses & Code Smell)

Để hệ thống thực sự sẵn sàng chạy Product thực tế (Production-ready), nhóm cần giải quyết các vấn đề sau:

### A. Lạm dụng Try-Catch trong API Controllers (Bỏ qua Global Middleware)
> [!WARNING]
> Hầu hết các Controllers (như `BookingController.cs`, `MatchController.cs`) đều bọc toàn bộ code trong `try-catch` và trả về `BadRequest(new { message = ex.Message })`.

* **Vấn đề:** 
  1. Việc này làm mất đi vai trò của `GlobalExceptionMiddleware.cs` đã viết ở API layer.
  2. Gây trùng lặp code (Boilerplate) ở tất cả các endpoint.
  3. Mọi lỗi (từ lỗi logic, nhập liệu sai đến lỗi sập DB) đều bị chuyển thành HTTP 400 (Bad Request), gây khó khăn cho việc giám sát lỗi (monitoring) và hiển thị thông điệp phù hợp cho Client.
* **Đề xuất:**
  - Loại bỏ các khối `try-catch` dư thừa trong Controller. Hãy để Exception tự động nổi lên (bubble up) đến `GlobalExceptionMiddleware`.
  - Định nghĩa các Custom Exception lớp Domain (ví dụ: `NotFoundException`, `ValidationException`, `BusinessRuleException`).
  - Cấu hình Middleware bắt các Custom Exception này và ánh xạ sang HTTP Status Code tương ứng (404, 422, 400) thay vì trả về 500 hay gom hết vào 400.

### B. Vi phạm nguyên tắc Layering trong Clean Architecture
> [!CAUTION]
> File `AdminService.cs` đang được đặt trong project `SportConnect.Infrastructure\Services` thay vì `SportConnect.Application\Services`. Đồng thời, nó trực tiếp tiêm (inject) `MyDbContext` để query thay vì dùng `IUnitOfWork` / `IGenericRepository`.

* **Vấn đề:**
  - Logic quản trị admin (duyệt sân, xem danh sách user) là **Business Logic (Use Cases)**, bắt buộc phải nằm ở tầng `Application`. Tầng `Infrastructure` chỉ nên chứa các dịch vụ kỹ thuật (Email, SMS, File Storage, OAuth).
  - Sử dụng trực tiếp `MyDbContext` trong Service phá vỡ lớp trừu tượng (abstraction) của Repository Pattern mà dự án đã thiết lập.
* **Đề xuất:**
  - Di chuyển `AdminService.cs` về `SportConnect.Application/Services/`.
  - Refactor lại code để gọi DB thông qua `IUnitOfWork` và Repositories. Đối với các truy vấn phức tạp cần `.Include()`, có thể mở rộng Repository hoặc bổ sung phương thức trong `IUserRepository` thay vì bypass bằng DbContext trực tiếp.

### C. Quy trình khôi phục mật khẩu không an toàn (Security Risk)
> [!IMPORTANT]
> Hàm `ForgotPasswordAsync` sinh một mật khẩu ngẫu nhiên 8 ký tự, lưu trực tiếp Hash vào DB và gửi mật khẩu thô đó qua email.

* **Vấn đề:**
  - Nếu email bị chặn hoặc lộ, tài khoản của user sẽ bị chiếm đoạt. Hơn nữa, việc tự ý thay đổi mật khẩu của user khi họ chưa xác nhận là không tối ưu.
* **Đề xuất:**
  - Thay vì đổi mật khẩu ngay, hãy tạo ra một **Reset Token** có thời hạn (ví dụ: 15 phút), lưu token này vào DB (hoặc Redis) kèm thời gian hết hạn.
  - Gửi một đường link qua email: `https://sportconnect.vn/reset-password?token={Token}`.
  - User click vào link để tự nhập mật khẩu mới của mình.

### D. Thiếu tính toàn vẹn dữ liệu (Transaction Management)
* **Vấn đề:** Trong `OwnerOnboardingService.SubmitAsync`, hệ thống thực hiện cập nhật `OwnerProfile` đồng thời khởi tạo thực thể `Venue` mới từ dữ liệu nháp. Việc này không được bọc trong một Transaction. Nếu bước tạo `Venue` bị lỗi (ví dụ: lỗi parse JSON), bản ghi `OwnerProfile` vẫn có thể đã bị thay đổi trạng thái thành `Completed`, dẫn đến dữ liệu không nhất quán.
* **Đề xuất:** Sử dụng cơ chế Transaction của EF Core thông qua `IUnitOfWork` (hoặc `DbContext.Database.BeginTransactionAsync()`) để đảm bảo tất cả các thay đổi thành công hoặc cùng rollback nếu có bất cứ lỗi nào xảy ra.

### E. Frontend thiếu cơ chế Silent Token Refresh
* **Vấn đề:** Trong `axiosClient.ts`, khi nhận mã lỗi 401 hoặc 403, client lập tức xóa token khỏi LocalStorage và ép user chuyển hướng về trang `/login`. Đối với một ứng dụng PWA, việc bị đẩy ra màn hình login liên tục khi JWT Token hết hạn (thường chỉ sống 30-60 phút) sẽ tạo ra trải nghiệm sử dụng rất tệ.
* **Đề xuất:** 
  - Triển khai cơ chế Refresh Token: Khi API trả về 401, Axios interceptor sẽ tự động chặn request đó lại, gọi ngầm API `/api/auth/refresh` bằng Refresh Token lưu trong Secure Cookie (hoặc LocalStorage) để lấy Access Token mới, cập nhật lại header và gửi lại request lỗi trước đó mà user không hề nhận ra sự gián đoạn.

### F. Sử dụng Hardcoded Strings cho các trạng thái (Status)
* **Vấn đề:** Các trạng thái như `"AVAILABLE"`, `"PENDING"`, `"CANCELLED"`, `"Verified"`, `"Rejected"` đang được viết dạng chuỗi cứng (string literals) rải rác ở cả Backend và Frontend, rất dễ dẫn đến lỗi gõ sai chính tả (typo).
* **Đề xuất:** Khai báo các `enum` hoặc hằng số (constants) ở tầng `Core` và frontend constants để dùng chung.

---

## 4. Kế Hoạch & Lộ Trình Phát Triển Tiếp Theo (Feature Roadmap)

Dựa trên phân tích hiện trạng hệ thống, các tính năng quan trọng nhất cần ưu tiên hoàn thiện được xếp theo thứ tự sau:

### 🚀 Ưu tiên 1: Xây dựng Giao diện Tìm Đối / Ghép Đội (Matchmaking UI)
* **Lý do:** Tầng Backend đã hoàn thiện đầy đủ thực thể `Match`, `MatchPlayer` cùng `MatchService` và `MatchController` (đăng kèo, xin tham gia, duyệt thành viên). Tuy nhiên, **Frontend hiện tại chưa có bất kỳ trang UI hay Service nào liên kết tới tính năng này**.
* **Công việc cụ thể:**
  1. Tạo `matchService.ts` trong frontend để gọi các API `/api/matches`.
  2. Viết các custom query hooks (`useMatches`, `useMatchDetail`) và mutations (`useCreateMatch`, `useJoinMatch`, `useApproveJoin`).
  3. Thiết kế các trang giao diện (mobile-first):
     * **Trang danh sách kèo đấu:** Lọc theo trạng thái (Đang tuyển, Đã đủ), môn thể thao, thời gian.
     * **Trang tạo kèo nhanh:** Cho phép chủ sân hoặc người đặt sân tạo kèo ghép từ đơn đặt sân thành công của họ.
     * **Trang chi tiết trận đấu:** Hiển thị thông tin sân, thời gian, mức phí chia sẻ, danh sách người tham gia và nút bấm "Xin tham gia".
     * **Trang quản lý yêu cầu:** Dành cho chủ kèo duyệt hoặc từ chối các yêu cầu xin ghép đội.

### 💳 Ưu tiên 2: Tích hợp Cổng Thanh Toán Trực Tuyến (VNPay / MoMo)
* **Lý do:** Để vận hành thực tế, chủ sân cần nhận tiền đặt cọc (hoặc thanh toán 100%) để giữ chỗ, hạn chế tối đa tình trạng "bùng lịch" (No-show).
* **Công việc cụ thể:**
  1. Đăng ký tài khoản Sandbox VNPay.
  2. Viết dịch vụ thanh toán ở Backend: Tạo URL thanh toán VNPay và xử lý webhook (IPN) để nhận kết quả thanh toán từ ngân hàng nhằm cập nhật tự động trạng thái đơn đặt sân từ `PENDING` sang `CONFIRMED`.
  3. Frontend: Hiển thị phương thức thanh toán VNPay/MoMo tại bước xác nhận đặt sân, điều hướng sang trang cổng thanh toán và xử lý trang phản hồi kết quả (Payment Success/Fail Page).

### 🔔 Ưu tiên 3: Hệ thống Thông Báo Thời Gian Thực (Real-time Notifications)
* **Lý do:** Người dùng cần biết ngay khi yêu cầu ghép đội được duyệt, hoặc chủ sân cần biết khi có lịch đặt mới.
* **Công việc cụ thể:**
  1. Tích hợp **SignalR** vào Backend để đẩy thông báo thời gian thực.
  2. Frontend thiết kế chuông thông báo (Notification Center) nhận tin nhắn tức thì.
  3. Cấu hình Web Push Notifications của PWA để đẩy thông báo ngay cả khi người dùng không mở app trên điện thoại.

### ⭐ Ưu tiên 4: Hệ thống Đánh Giá & Tính Trust Score Tự Động
* **Lý do:** Để đảm bảo tính lành mạnh của cộng đồng thể thao, hệ thống cần cơ chế đánh giá.
* **Công việc cụ thể:**
  1. Thiết kế Entity `Review` (User đánh giá sân, User đánh giá chủ kèo).
  2. Backend tự động trừ điểm uy tín (`TrustScore`) của người dùng nếu họ đặt lịch nhưng không đến (No-show) dựa trên báo cáo của chủ sân.
  3. Frontend tích hợp form đánh giá 5 sao kèm bình luận.

---

## 5. Kết Luận & Hành Động Tiếp Theo

Dự án SportConnect hiện tại đã có một nền tảng rất vững chắc về mặt cấu trúc và xử lý nghiệp vụ đặt sân cơ bản. Các đề xuất tái cấu trúc ở mục 3 không tốn quá nhiều thời gian nhưng sẽ giúp hệ thống đạt độ ổn định và an toàn cao của một sản phẩm thương mại.

**Hành động đề xuất cho Sprint tiếp theo:**
1. **Dành 1-2 ngày** để dọn dẹp các khối `try-catch` trong controllers, chuyển `AdminService` về đúng tầng `Application`, bổ sung Transaction cho luồng đăng ký chủ sân và cấu hình refresh token ở frontend.
2. **Dành phần lớn thời gian còn lại** để triển khai trọn gói giao diện **Matchmaking (Tìm đối/Ghép đội)** để đồng bộ hoàn toàn tính năng giữa Backend và Frontend.
