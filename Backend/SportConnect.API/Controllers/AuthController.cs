using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.Auth;
using SportConnect.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SportConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _config;

    public AuthController(IAuthService authService, IConfiguration config)
    {
        _authService = authService;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var token = await _authService.LoginAsync(loginDto);
        return Ok(new { Token = token });
    }

    /// <summary>
    /// Admin login — yêu cầu thêm AdminKey, xác thực role Admin trong DB
    /// </summary>
    [HttpPost("admin-login")]
    public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto dto)
    {
        // 1. Kiểm tra AdminKey bí mật
        var expectedKey = _config["AdminSettings:SecretKey"];
        if (string.IsNullOrEmpty(dto.AdminKey) || dto.AdminKey != expectedKey)
        {
            return Unauthorized(new { isSuccess = false, message = "Admin key không hợp lệ." });
        }

        // 2. Đăng nhập + kiểm tra role Admin (AdminLoginAsync throw nếu không phải Admin)
        var loginDto = new LoginDto { UsernameOrEmail = dto.Username, Password = dto.Password };
        var token = await _authService.AdminLoginAsync(loginDto);

        return Ok(new { isSuccess = true, token });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var token = await _authService.RegisterAsync(registerDto);
        return Ok(new { Message = "User registered successfully!", Token = token });
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto googleLoginDto)
    {
        var token = await _authService.GoogleLoginAsync(googleLoginDto);
        return Ok(new { Token = token });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        // Trả về token mới với roles cập nhật từ DB
        var newToken = await _authService.RefreshTokenAsync(userId);
        return Ok(new { isSuccess = true, token = newToken });
    }

    /// <summary>
    /// Cấp lại JWT với roles mới nhất từ DB (dùng sau khi admin duyệt owner)
    /// </summary>
    [Authorize]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var newToken = await _authService.RefreshTokenAsync(userId);
        return Ok(new { isSuccess = true, token = newToken });
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { Message = "User is not authorized." });

        await _authService.ChangePasswordAsync(userId, dto);
        return Ok(new { Message = "Đổi mật khẩu thành công!" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { Message = "Email không được để trống." });

        await _authService.ForgotPasswordAsync(dto);
        return Ok(new { Message = "Mật khẩu mới đã được gửi vào email của bạn." });
    }
}
