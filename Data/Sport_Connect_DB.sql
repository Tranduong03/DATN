CREATE TABLE [Users] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [username] NVARCHAR(255) UNIQUE NOT NULL,
  [email] NVARCHAR(255) UNIQUE NOT NULL,
  [password_hash] NVARCHAR(255) NOT NULL,
  [full_name] NVARCHAR(255),
  [phone] NVARCHAR(50),
  [avatar_url] NVARCHAR(MAX),
  [created_at] DATETIME DEFAULT (GETDATE()),
  [status] BIT
)
GO

CREATE TABLE [Roles] (
  [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT (NEWID()),
  [role_name] NVARCHAR(255) UNIQUE NOT NULL,
  [description] NVARCHAR(255)
)
GO

CREATE TABLE [User_Role] (
  [user_id] UNIQUEIDENTIFIER,
  [role_id] UNIQUEIDENTIFIER,
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
  [role_id] UNIQUEIDENTIFIER,
  [permission_id] UNIQUEIDENTIFIER,
  PRIMARY KEY ([role_id], [permission_id])
)
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '0: Banned, 1: Active',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Users',
@level2type = N'Column', @level2name = 'status';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'ADMIN, OWNER, HOST, GUEST',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Roles',
@level2type = N'Column', @level2name = 'role_name';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = N'Ví dụ: CREATE_FIELD, BOOK_MATCH, BLOCK_USER',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Permissions',
@level2type = N'Column', @level2name = 'permission_code';
GO

ALTER TABLE [User_Role] ADD FOREIGN KEY ([user_id]) REFERENCES [Users] ([id])
GO

ALTER TABLE [User_Role] ADD FOREIGN KEY ([role_id]) REFERENCES [Roles] ([id])
GO

ALTER TABLE [Role_Permission] ADD FOREIGN KEY ([role_id]) REFERENCES [Roles] ([id])
GO

ALTER TABLE [Role_Permission] ADD FOREIGN KEY ([permission_id]) REFERENCES [Permissions] ([id])
GO