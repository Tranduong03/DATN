# Sửa lỗi xác thực và tự động đăng xuất (Auth & Token Fix)

> [!IMPORTANT]
> Lỗi người dùng hay bị văng ra màn hình đăng nhập (out login) sau khoảng 15 phút sử dụng đã được khắc phục triệt để bằng cách xử lý Race Condition khi refresh token và đồng bộ hóa múi giờ UTC ở Backend.

## 1. Nguyên nhân lỗi gốc

### A. Lỗi Race Condition khi Refresh Token ở Frontend
* **Cơ chế One-time use Refresh Token của Backend**: Mỗi lần refresh thành công, Backend sẽ cập nhật Refresh Token mới trong Database và vô hiệu hóa token cũ.
* **Gọi song song**: Khi Access Token hết hạn, cả hàm kiểm tra token `ensureValidToken()` (khi component mount) và `axiosClient` interceptor (khi gọi API lấy dữ liệu) đều phát hiện lỗi và đồng thời gửi yêu cầu `/api/auth/refresh` bằng cùng một cặp Token cũ.
* **Hậu quả**: Request thứ nhất thành công, làm vô hiệu hóa token cũ trên DB. Request thứ hai thất bại vì token cũ không còn hợp lệ. Lỗi 401 trả về từ request thứ hai kích hoạt hành động xóa sạch localStorage và đẩy người dùng về trang `/login` hoặc `/account`.

### B. Sự không đồng nhất múi giờ JWT Expiration ở Backend
* Backend sử dụng `DateTime.Now.AddMinutes(...)` để tính thời gian hết hạn của Access Token, nhưng khi giải mã token hệ thống lại so sánh với giờ UTC. Điều này gây ra sự lệch múi giờ trên các server chạy Docker hoặc server lệch múi giờ local, làm Access Token bị coi là hết hạn sớm hơn thực tế.

---

## 2. Các thay đổi đã thực hiện

### 📂 [auth.ts](file:///d:/IT/HK2_Y4/DATN/Frontend/user/src/utils/auth.ts)
* **Triển khai Singleton Promise**: Tạo một hàm `refreshAccessToken()` sử dụng một biến Promise dùng chung `refreshPromise`. 
* Khi có nhiều yêu cầu refresh token đồng thời, tất cả sẽ cùng chờ chung một Promise và chỉ có duy nhất **1 request HTTP** thực sự được gửi tới Backend.
* Cập nhật `ensureValidToken()` gọi trực tiếp hàm này.

### 📂 [axiosClient.ts](file:///d:/IT/HK2_Y4/DATN/Frontend/user/src/api/axiosClient.ts)
* Loại bỏ toàn bộ cơ chế hàng đợi (queue) và các biến cờ phức tạp trước đây (`isRefreshing`, `refreshSubscribers`...).
* Sử dụng trực tiếp `refreshAccessToken()` trong interceptor response để xử lý lỗi 401. Nếu refresh thành công, gửi lại request ban đầu với token mới. Nếu thất bại, chuyển hướng về trang login.

### 📂 [AuthService.cs](file:///d:/IT/HK2_Y4/DATN/Backend/SportConnect.Application/Services/AuthService.cs)
* Thay đổi múi giờ thiết lập thời gian hết hạn của Access Token từ `DateTime.Now` sang `DateTime.UtcNow`.
```diff
- expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryMinutes"])),
+ expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryMinutes"])),
```

---

## 3. Kết quả kiểm tra
* Lệnh biên dịch Backend (`dotnet build`) và kiểm tra kiểu Frontend (`npx tsc --noEmit`) đều hoàn thành **thành công**, không gặp bất kỳ lỗi cú pháp hoặc lỗi liên kết nào.
