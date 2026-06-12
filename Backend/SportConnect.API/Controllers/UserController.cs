using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.User;
using SportConnect.Application.DTOs.Recommendation;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/users")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _userService.GetUserProfileAsync(GetUserId());
        if (profile == null) return NotFound(new { isSuccess = false, message = "Profile not found" });
        return Ok(new { isSuccess = true, data = profile });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var profile = await _userService.UpdateUserProfileAsync(GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Cập nhật hồ sơ thành công!", data = profile });
    }

    [HttpGet("recommendations/matches")]
    [Authorize]
    public async Task<IActionResult> GetMatchRecommendations()
    {
        var matches = await _userService.GetMatchRecommendationsAsync(GetUserId());
        return Ok(new { isSuccess = true, data = matches });
    }

    [HttpGet("recommendations/teams")]
    [Authorize]
    public async Task<IActionResult> GetTeamRecommendations()
    {
        var teams = await _userService.GetTeamRecommendationsAsync(GetUserId());
        return Ok(new { isSuccess = true, data = teams });
    }

    [HttpPost("quick-match")]
    [Authorize]
    public async Task<IActionResult> QuickMatch([FromBody] QuickMatchRequestDto dto)
    {
        var match = await _userService.QuickMatchAsync(GetUserId(), dto);
        if (match == null) return Ok(new { isSuccess = true, message = "Không tìm thấy kèo đấu phù hợp theo yêu cầu.", data = (object?)null });
        return Ok(new { isSuccess = true, message = "Đã tìm thấy kèo đấu phù hợp!", data = match });
    }
}
