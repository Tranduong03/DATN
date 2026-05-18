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
        try
        {
            var token = await _authService.LoginAsync(loginDto);
            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Admin login — yêu cầu thêm AdminKey, xác thực role Admin trong DB
    /// </summary>
    [HttpPost("admin-login")]
    public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto dto)
    {
        try
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
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { isSuccess = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            var token = await _authService.RegisterAsync(registerDto);
            return Ok(new { Message = "User registered successfully!", Token = token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto googleLoginDto)
    {
        try
        {
            var token = await _authService.GoogleLoginAsync(googleLoginDto);
            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok("Authorized");
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { Message = "User is not authorized." });

            await _authService.ChangePasswordAsync(userId, dto);
            return Ok(new { Message = "Đổi mật khẩu thành công!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { Message = "Email không được để trống." });

        try
        {
            await _authService.ForgotPasswordAsync(dto);
            return Ok(new { Message = "Mật khẩu mới đã được gửi vào email của bạn." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
