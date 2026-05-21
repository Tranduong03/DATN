using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/matches")]
[ApiController]
public class MatchController : ControllerBase
{
    private readonly IMatchService _matchService;

    public MatchController(IMatchService matchService)
    {
        _matchService = matchService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMatches([FromQuery] string? status)
    {
        try
        {
            var matches = await _matchService.GetAllMatchesAsync(status);
            return Ok(new { isSuccess = true, data = matches });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMatch(Guid id)
    {
        try
        {
            var match = await _matchService.GetMatchByIdAsync(id);
            if (match == null) return NotFound(new { isSuccess = false, message = "Match not found" });
            return Ok(new { isSuccess = true, data = match });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateMatch([FromBody] CreateMatchDto dto)
    {
        try
        {
            var match = await _matchService.CreateMatchAsync(GetUserId(), dto);
            return Ok(new { isSuccess = true, message = "Tạo trận đấu thành công!", data = match });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpPost("{id}/join")]
    [Authorize]
    public async Task<IActionResult> JoinMatch(Guid id)
    {
        try
        {
            var success = await _matchService.JoinMatchAsync(id, GetUserId());
            return Ok(new { isSuccess = true, message = "Đã gửi yêu cầu tham gia trận đấu!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpPut("{id}/approve/{userId}")]
    [Authorize]
    public async Task<IActionResult> ApproveJoin(Guid id, Guid userId)
    {
        try
        {
            var success = await _matchService.ApproveJoinRequestAsync(id, GetUserId(), userId);
            return Ok(new { isSuccess = true, message = "Đã duyệt yêu cầu tham gia!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }
}
