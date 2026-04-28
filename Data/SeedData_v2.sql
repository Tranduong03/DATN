-- ==========================================
-- 2. SEED DATA MỞ RỘNG
-- ==========================================

-- Lấy ID của Venue đã tạo ở bước trước
DECLARE @VenueId UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM Venues WHERE name = N'Sân Cầu Lông Huế An');

-- 1. Tạo 3 sân nhỏ cho khu sân này
DECLARE @Court1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Court2Id UNIQUEIDENTIFIER = NEWID();

INSERT INTO [Courts] ([id], [venue_id], [court_name]) VALUES
(@Court1Id, @VenueId, N'Sân số 1'),
(@Court2Id, @VenueId, N'Sân số 2')

-- 2. Thiết lập quy tắc giá cho Venue này
INSERT INTO [PriceRules] ([venue_id], [day_of_week], [start_hour], [end_hour], [price], [description]) VALUES
(@VenueId, NULL, '05:00:00', '16:00:00', 50000, N'Giờ hành chính (Sáng & Chiều)'),
(@VenueId, NULL, '17:00:00', '22:00:00', 90000, N'Giờ vàng (Buổi tối)'),
(@VenueId, 0, '05:00:00', '22:00:00', 100000, N'Giá cố định ngày Chủ Nhật');

-- 3. Cập nhật Booking mẫu vào Sân số 1 thay vì Venue chung chung
UPDATE [Bookings] SET [court_id] = @Court1Id WHERE [total_price] = 200000;
GO