using SportConnect.Application.DTOs.Auth;

namespace SportConnect.Application.Interfaces;

public interface IAuthService
{
  Task<string> LoginAsync(LoginDto loginDto);
  Task<bool> RegisterAsync(RegisterDto registerDto);
  Task<string> GoogleLoginAsync(GoogleLoginDto googleLoginDto);
  Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto);
}
