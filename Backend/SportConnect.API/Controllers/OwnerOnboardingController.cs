using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.OwnerOnboarding;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class OwnerOnboardingController : ControllerBase
{
    private readonly IOwnerOnboardingService _onboardingService;

    public OwnerOnboardingController(IOwnerOnboardingService onboardingService)
    {
        _onboardingService = onboardingService;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new UnauthorizedAccessException("User not found or invalid token.");
        }
        return userId;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var userId = GetUserId();
        var status = await _onboardingService.GetStatusAsync(userId);
        return Ok(new { isSuccess = true, data = status });
    }

    [HttpPost("save-draft")]
    public async Task<IActionResult> SaveDraft([FromBody] SaveDraftDto dto)
    {
        var userId = GetUserId();
        await _onboardingService.SaveDraftAsync(userId, dto);
        return Ok(new { isSuccess = true, message = "Draft saved successfully" });
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SaveDraftDto dto)
    {
        var userId = GetUserId();
        await _onboardingService.SubmitAsync(userId, dto.DraftData);
        return Ok(new { isSuccess = true, message = "Application submitted successfully" });
    }
}
