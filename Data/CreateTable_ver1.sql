-- ==========================================
-- PHẦN 1: TẠO CẤU TRÚC BẢNG (SCHEMA)
-- ==========================================

CREATE TABLE [Users] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [username] NVARCHAR(255) UNIQUE NOT NULL,
  [email] NVARCHAR(255) UNIQUE NOT NULL,
  [password_hash] NVARCHAR(255) NOT NULL,
  [full_name] NVARCHAR(255),
  [phone] NVARCHAR(50),
  [avatar_url] NVARCHAR(MAX),
  [trust_score] FLOAT DEFAULT 5.0,
  [no_show_count] INT DEFAULT 0,
  [created_at] DATETIME DEFAULT (GETDATE()),
  [status] BIT DEFAULT 1
)
GO

CREATE TABLE [Roles] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [role_name] NVARCHAR(50) UNIQUE NOT NULL,
  [description] NVARCHAR(255)
)
GO

CREATE TABLE [User_Role] (
  [user_id] UNIQUEIDENTIFIER REFERENCES [Users]([id]),
  [role_id] UNIQUEIDENTIFIER REFERENCES [Roles]([id]),
  PRIMARY KEY ([user_id], [role_id])
)
GO

CREATE TABLE [Permissions] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [permission_code] NVARCHAR(255) UNIQUE NOT NULL,
  [permission_name] NVARCHAR(255) NOT NULL,
  [description] NVARCHAR(MAX)
)
GO

CREATE TABLE [Role_Permission] (
  [role_id] UNIQUEIDENTIFIER REFERENCES [Roles]([id]),
  [permission_id] UNIQUEIDENTIFIER REFERENCES [Permissions]([id]),
  PRIMARY KEY ([role_id], [permission_id])
)
GO

CREATE TABLE [Venues] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [owner_id] UNIQUEIDENTIFIER REFERENCES [Users]([id]),
  [name] NVARCHAR(255) NOT NULL,
  [address] NVARCHAR(MAX) NOT NULL,
  [bank_qr_url] NVARCHAR(MAX), 
  [created_at] DATETIME DEFAULT (GETDATE()),
  [status] NVARCHAR(50) DEFAULT 'ACTIVE'
)
GO

CREATE TABLE [Bookings] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [booker_id] UNIQUEIDENTIFIER REFERENCES [Users]([id]), 
  [venue_id] UNIQUEIDENTIFIER REFERENCES [Venues]([id]),
  [start_time] DATETIME NOT NULL,
  [end_time] DATETIME NOT NULL,
  [total_price] DECIMAL(18,2) NOT NULL,
  [receipt_url] NVARCHAR(MAX), 
  [status] NVARCHAR(50) NOT NULL, 
  [created_at] DATETIME DEFAULT (GETDATE())
)
GO

CREATE TABLE [Matches] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [booking_id] UNIQUEIDENTIFIER UNIQUE REFERENCES [Bookings]([id]), 
  [host_id] UNIQUEIDENTIFIER REFERENCES [Users]([id]), 
  [title] NVARCHAR(255) NOT NULL,
  [skill_level] NVARCHAR(50), 
  [max_players] INT NOT NULL,
  [fee_per_player] DECIMAL(18,2) NOT NULL,
  [status] NVARCHAR(50) DEFAULT 'OPEN', 
  [created_at] DATETIME DEFAULT (GETDATE())
)
GO

CREATE TABLE [Match_Players] (
  [match_id] UNIQUEIDENTIFIER REFERENCES [Matches]([id]),
  [user_id] UNIQUEIDENTIFIER REFERENCES [Users]([id]),
  [joined_at] DATETIME DEFAULT (GETDATE()),
  [status] NVARCHAR(50) DEFAULT 'PENDING', 
  PRIMARY KEY ([match_id], [user_id])
)
GO

-- Thêm chú thích cho các cột quan trọng
EXEC sp_addextendedproperty @name=N'MS_Description', @value=N'Trạng thái: HOLDING, PENDING, CONFIRMED, CANCELLED', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=N'Bookings', @level2type=N'COLUMN', @level2name=N'status';
EXEC sp_addextendedproperty @name=N'MS_Description', @value=N'Trạng thái: OPEN, FULL, COMPLETED, CANCELLED', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=N'Matches', @level2type=N'COLUMN', @level2name=N'status';
EXEC sp_addextendedproperty @name=N'MS_Description', @value=N'Trạng thái: PENDING, APPROVED, REJECTED, NO_SHOW', @level0type=N'SCHEMA', @level0name=N'dbo', @level1type=N'TABLE', @level1name=N'Match_Players', @level2type=N'COLUMN', @level2name=N'status';
GO
