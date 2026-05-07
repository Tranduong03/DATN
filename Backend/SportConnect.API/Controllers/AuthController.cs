using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.Auth;
using SportConnect.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace SportConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
  private readonly IAuthService _authService;

  public AuthController(IAuthService authService)
  {
    _authService = authService;
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

  [HttpPost("register")]
  public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
  {
    try
    {
      var success = await _authService.RegisterAsync(registerDto);
      return Ok(new { Message = "User registered successfully!" });
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
}
