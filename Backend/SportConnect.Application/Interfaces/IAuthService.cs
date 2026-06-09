using SportConnect.Application.DTOs.Auth;

namespace SportConnect.Application.Interfaces;

public interface IAuthService
{
  Task<AuthResultDto> LoginAsync(LoginDto loginDto);
  Task<AuthResultDto> AdminLoginAsync(LoginDto loginDto); // Login + kiểm tra role Admin
  Task<AuthResultDto> RegisterAsync(RegisterDto registerDto);
  Task<AuthResultDto> GoogleLoginAsync(GoogleLoginDto googleLoginDto);
  Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto);
  Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto);
  Task<string> RefreshTokenAsync(Guid userId); // Cấp lại JWT với roles mới nhất từ DB
  Task<AuthResultDto> RefreshAsync(RefreshTokenDto dto); // Silent refresh ngầm bằng Refresh Token
}
