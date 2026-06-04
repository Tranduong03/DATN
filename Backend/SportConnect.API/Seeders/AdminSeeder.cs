using Microsoft.EntityFrameworkCore;
using SportConnect.Core.Constants;
using SportConnect.Core.Entities;
using SportConnect.Infrastructure.Persistence.Context;

namespace SportConnect.API.Seeders;

public static class AdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration config)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<MyDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        var adminSettings = config.GetSection("AdminSettings");
        var username = adminSettings["DefaultAdminUsername"] ?? "admin";
        var email = adminSettings["DefaultAdminEmail"] ?? "admin@sportconnect.local";
        var password = adminSettings["DefaultAdminPassword"] ?? "admin";

        try
        {
            // 1. Đảm bảo Role "Admin" tồn tại
            var adminRole = await context.Roles
                .FirstOrDefaultAsync(r => r.RoleName == AppRoles.Admin);

            if (adminRole == null)
            {
                adminRole = new Role
                {
                    RoleName = AppRoles.Admin,
                    Description = "Quản trị viên hệ thống"
                };
                context.Roles.Add(adminRole);
                await context.SaveChangesAsync();
                logger.LogInformation("✅ Đã tạo Role 'Admin'");
            }

            // 2. Kiểm tra tài khoản admin đã tồn tại chưa
            var adminUser = await context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (adminUser == null)
            {
                adminUser = new User
                {
                    Username = username,
                    Email = email,
                    FullName = "System Administrator",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    Status = true,
                    AvatarUrl = "/src/assets/icon/avata_boy_1.avif"
                };
                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
                logger.LogInformation("✅ Đã tạo tài khoản Admin: {Username}", username);
            }

            // 3. Gán Role Admin nếu chưa có
            var hasAdminRole = await context.UserRoles
                .AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id);

            if (!hasAdminRole)
            {
                context.UserRoles.Add(new UserRole
                {
                    UserId = adminUser.Id,
                    RoleId = adminRole.Id
                });
                await context.SaveChangesAsync();
                logger.LogInformation("✅ Đã gán Role 'Admin' cho user '{Username}'", username);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "❌ AdminSeeder thất bại: {Message}", ex.Message);
        }
    }
}
