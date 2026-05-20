using SportConnect.Application.DTOs.Auth;

namespace SportConnect.Application.Interfaces;

public interface IAuthService
{
  Task<string> LoginAsync(LoginDto loginDto);
  Task<string> AdminLoginAsync(LoginDto loginDto); // Login + kiểm tra role Admin
  Task<string> RegisterAsync(RegisterDto registerDto);
  Task<string> GoogleLoginAsync(GoogleLoginDto googleLoginDto);
  Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto);
  Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto);
  Task<string> RefreshTokenAsync(Guid userId); // Cấp lại JWT với roles mới nhất từ DB
}
