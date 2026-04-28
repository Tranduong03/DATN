-- ==========================================
-- 1. TẠO CÁC BẢNG MỞ RỘNG
-- ==========================================

-- Bảng Sân nhỏ (Ví dụ: Sân 1, Sân 2 thuộc Khu sân A)
CREATE TABLE [Courts] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [venue_id] UNIQUEIDENTIFIER REFERENCES [Venues]([id]),
  [court_name] NVARCHAR(100) NOT NULL, -- Ví dụ: Sân số 1, Sân VIP
  [status] NVARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, MAINTENANCE (Bảo trì)
  [created_at] DATETIME DEFAULT (GETDATE())
)
GO

-- Bảng Quy tắc giá (Cấu hình giá linh hoạt)
CREATE TABLE [PriceRules] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [venue_id] UNIQUEIDENTIFIER REFERENCES [Venues]([id]),
  [day_of_week] INT, -- 0: Chủ nhật, 1-6: Thứ 2-7, NULL: Áp dụng tất cả các ngày
  [start_hour] TIME NOT NULL, -- Ví dụ: 05:00:00
  [end_hour] TIME NOT NULL,   -- Ví dụ: 16:00:00
  [price] DECIMAL(18,2) NOT NULL,
  [description] NVARCHAR(255)
)
GO

-- CẬP NHẬT BẢNG BOOKINGS (Thay đổi liên kết từ Venue sang Court)
-- 1. Xóa đúng tên khóa ngoại đang ràng buộc cột venue_id
ALTER TABLE [Bookings] DROP CONSTRAINT [FK__Bookings__venue___571DF1D5];
GO

-- 2. Lúc này cột venue_id đã được tự do, có thể xóa nó
ALTER TABLE [Bookings] DROP COLUMN [venue_id];
GO

-- 3. Thêm cột court_id mới và tạo liên kết tới bảng Courts
ALTER TABLE [Bookings] ADD [court_id] UNIQUEIDENTIFIER REFERENCES [Courts]([id]);
GO

