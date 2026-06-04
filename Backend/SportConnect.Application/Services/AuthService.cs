using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SportConnect.Application.DTOs.Auth;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;
using SportConnect.Core.Constants;
using SportConnect.Core.Exceptions;

namespace SportConnect.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthService(IUnitOfWork unitOfWork, IConfiguration config, IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _config = config;
        _emailService = emailService;
    }

    public async Task<string> LoginAsync(LoginDto loginDto)
    {
        var users = await _unitOfWork.Repository<User>().FindAsync(u => 
            u.Username == loginDto.UsernameOrEmail || u.Email == loginDto.UsernameOrEmail || u.Phone == loginDto.UsernameOrEmail);
        
        var user = users.FirstOrDefault();

        if (user == null)
        {
            throw new AppException("Invalid username/email or password.");
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new AppException("Vui lòng đăng nhập bằng Google hoặc thiết lập mật khẩu qua Quên mật khẩu.");
        }

        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new AppException("Invalid username/email or password.");
        }

        return await GenerateJwtTokenAsync(user);
    }

    public async Task<string> AdminLoginAsync(LoginDto loginDto)
    {
        var users = await _unitOfWork.Repository<User>().FindAsync(u => 
            u.Username == loginDto.UsernameOrEmail || u.Email == loginDto.UsernameOrEmail || u.Phone == loginDto.UsernameOrEmail);
        
        var user = users.FirstOrDefault();

        if (user == null)
        {
            throw new AppException("Tài khoản hoặc mật khẩu không đúng.");
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new AppException("Tài khoản không có mật khẩu hợp lệ.");
        }

        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new AppException("Tài khoản hoặc mật khẩu không đúng.");
        }

        // Kiểm tra Role Admin
        var userRoles = await _unitOfWork.Repository<UserRole>().FindAsync(ur => ur.UserId == user.Id);
        user.UserRoles = userRoles.ToList();
        
        bool isAdmin = false;
        foreach (var userRole in user.UserRoles)
        {
            userRole.Role = (await _unitOfWork.Repository<Role>().GetByIdAsync(userRole.RoleId))!;
            if (userRole.Role != null && userRole.Role.RoleName == AppRoles.Admin)
            {
                isAdmin = true;
            }
        }

        if (!isAdmin)
        {
            throw new AppException("Bạn không có quyền truy cập trang quản trị.");
        }

        return await GenerateJwtTokenAsync(user);
    }


    public async Task<string> RegisterAsync(RegisterDto registerDto)
    {
        if (string.IsNullOrEmpty(registerDto.Email) && string.IsNullOrEmpty(registerDto.Phone))
        {
            throw new AppException("Vui lòng nhập Email hoặc Số điện thoại.");
        }

        var existingUsers = await _unitOfWork.Repository<User>().FindAsync(u => 
            u.Username == registerDto.Username || 
            (!string.IsNullOrEmpty(registerDto.Email) && u.Email == registerDto.Email) || 
            (!string.IsNullOrEmpty(registerDto.Phone) && u.Phone == registerDto.Phone));
            
        if (existingUsers.Any())
        {
            throw new AppException("Username, Email hoặc Số điện thoại đã tồn tại.");
        }

        var defaultAvatars = new[]
        {
            "/src/assets/icon/avata_boy_1.avif",
            "/src/assets/icon/avata_boy_2.jpg",
            "/src/assets/icon/avata_girl_1.jpg",
            "/src/assets/icon/avata_girl_2.avif"
        };
        var avatarIndex = Math.Abs(registerDto.Username.GetHashCode()) % defaultAvatars.Length;

        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email ?? string.Empty,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FullName = registerDto.FullName,
            Phone = registerDto.Phone,
            AvatarUrl = defaultAvatars[avatarIndex]
        };

        await _unitOfWork.Repository<User>().AddAsync(user);

        var roles = await _unitOfWork.Repository<Role>().FindAsync(r => r.RoleName == AppRoles.Default);
        var defaultRole = roles.FirstOrDefault();
        if (defaultRole == null)
        {
            defaultRole = new Role { RoleName = AppRoles.Default, Description = "Người dùng cơ bản" };
            await _unitOfWork.Repository<Role>().AddAsync(defaultRole);
        }

        await _unitOfWork.Repository<UserRole>().AddAsync(new UserRole
        {
            UserId = user.Id,
            RoleId = defaultRole.Id
        });

        await _unitOfWork.CompleteAsync();

        return await GenerateJwtTokenAsync(user);
    }

    public async Task<string> GoogleLoginAsync(GoogleLoginDto googleLoginDto)
    {
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", googleLoginDto.Token);

        var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
        if (!response.IsSuccessStatusCode)
        {
            throw new AppException("Invalid Google token.");
        }

        var content = await response.Content.ReadAsStringAsync();
        var payload = JsonSerializer.Deserialize<JsonElement>(content);

        var email = payload.GetProperty("email").GetString();
        var name = payload.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : string.Empty;
        var picture = payload.TryGetProperty("picture", out var picProp) ? picProp.GetString() : string.Empty;
        var googleId = payload.TryGetProperty("sub", out var subProp) ? subProp.GetString() : string.Empty;

        if (string.IsNullOrEmpty(email))
        {
            throw new AppException("Google token did not contain an email.");
        }

        var existingUsers = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == email);
        var user = existingUsers.FirstOrDefault();

        if (user == null)
        {
            user = new User
            {
                Username = email.Split('@')[0] + Guid.NewGuid().ToString().Substring(0, 4),
                Email = email,
                PasswordHash = null,
                GoogleId = googleId,
                FullName = name,
                AvatarUrl = picture,
                Status = true
            };
            await _unitOfWork.Repository<User>().AddAsync(user);

            var roles = await _unitOfWork.Repository<Role>().FindAsync(r => r.RoleName == AppRoles.Default);
            var defaultRole = roles.FirstOrDefault();
            if (defaultRole == null)
            {
                defaultRole = new Role { RoleName = AppRoles.Default, Description = "Người dùng cơ bản" };
                await _unitOfWork.Repository<Role>().AddAsync(defaultRole);
            }

            await _unitOfWork.Repository<UserRole>().AddAsync(new UserRole
            {
                UserId = user.Id,
                RoleId = defaultRole.Id
            });

            await _unitOfWork.CompleteAsync();
        }
        else
        {
            // If user already exists but has no googleId, link the account
            if (string.IsNullOrEmpty(user.GoogleId))
            {
                user.GoogleId = googleId;
                _unitOfWork.Repository<User>().Update(user);
                await _unitOfWork.CompleteAsync();
            }
        }

        return await GenerateJwtTokenAsync(user);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null)
        {
            throw new AppException("User not found.");
        }

        // If user does not have a password (e.g. Google Login only), allow them to set one without OldPassword
        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            if (string.IsNullOrEmpty(changePasswordDto.OldPassword) || !BCrypt.Net.BCrypt.Verify(changePasswordDto.OldPassword, user.PasswordHash))
            {
                throw new AppException("Mật khẩu cũ không chính xác.");
            }
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        User? user = null;
        if (!string.IsNullOrEmpty(dto.Email))
        {
            var users = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == dto.Email);
            user = users.FirstOrDefault();
            if (user == null)
            {
                throw new AppException("Không tìm thấy tài khoản với email này.");
            }
        }
        else if (!string.IsNullOrEmpty(dto.Phone))
        {
            var users = await _unitOfWork.Repository<User>().FindAsync(u => u.Phone == dto.Phone);
            user = users.FirstOrDefault();
            if (user == null)
            {
                throw new AppException("Không tìm thấy tài khoản với số điện thoại này.");
            }
        }
        else
        {
            throw new AppException("Vui lòng cung cấp Email hoặc Số điện thoại.");
        }

        // Generate a random 8-character password
        var newPassword = GenerateRandomPassword(8);

        if (!string.IsNullOrEmpty(dto.Email))
        {
            // Send email FIRST
            string subject = "Cấp lại mật khẩu - SportConnect";
            string body = $@"
                <h3>Xin chào {user.FullName ?? user.Username},</h3>
                <p>Bạn đã yêu cầu cấp lại mật khẩu. Dưới đây là mật khẩu mới của bạn:</p>
                <p><strong>{newPassword}</strong></p>
                <p>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.</p>
                <p>Trân trọng,<br>Đội ngũ SportConnect</p>";

            await _emailService.SendEmailAsync(user.Email, subject, body);
        }
        else if (!string.IsNullOrEmpty(dto.Phone))
        {
            // Do not use SMS, print to console as requested by the user
            Console.WriteLine("==================================================");
            Console.WriteLine($"[SMS MOCK] Reset Password for Phone: {dto.Phone}");
            Console.WriteLine($"[SMS MOCK] User: {user.Username} ({user.FullName})");
            Console.WriteLine($"[SMS MOCK] New Password: {newPassword}");
            Console.WriteLine("==================================================");
        }

        // Update database only if email/sms mock succeeds
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    private string GenerateRandomPassword(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    public async Task<string> RefreshTokenAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) throw new AppException("User not found.");
        // GenerateJwtTokenAsync sẽ load roles mới nhất từ DB
        return await GenerateJwtTokenAsync(user);
    }

    private async Task<string> GenerateJwtTokenAsync(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username ?? ""),
            new Claim("FullName", user.FullName ?? ""),
            new Claim("AvatarUrl", user.AvatarUrl ?? "")
        };

        // Fix N+1: load all roles in one query, then look up in memory
        var userRoles = (await _unitOfWork.Repository<UserRole>().FindAsync(ur => ur.UserId == user.Id)).ToList();
        if (userRoles.Any())
        {
            var roleIds = userRoles.Select(ur => ur.RoleId).ToHashSet();
            var roles = await _unitOfWork.Repository<Role>().FindAsync(r => roleIds.Contains(r.Id));
            var rolesById = roles.ToDictionary(r => r.Id);
            foreach (var userRole in userRoles)
            {
                if (rolesById.TryGetValue(userRole.RoleId, out var role))
                    claims.Add(new Claim(ClaimTypes.Role, role.RoleName));
            }
        }

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryMinutes"])),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
