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
        var matches = await _matchService.GetAllMatchesAsync(status);
        return Ok(new { isSuccess = true, data = matches });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMatch(Guid id)
    {
        var match = await _matchService.GetMatchByIdAsync(id);
        if (match == null) return NotFound(new { isSuccess = false, message = "Match not found" });
        return Ok(new { isSuccess = true, data = match });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateMatch([FromBody] CreateMatchDto dto)
    {
        var match = await _matchService.CreateMatchAsync(GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Tạo trận đấu thành công!", data = match });
    }

    [HttpPost("{id}/join")]
    [Authorize]
    public async Task<IActionResult> JoinMatch(Guid id)
    {
        var success = await _matchService.JoinMatchAsync(id, GetUserId());
        return Ok(new { isSuccess = true, message = "Đã gửi yêu cầu tham gia trận đấu!" });
    }

    [HttpPut("{id}/approve/{userId}")]
    [Authorize]
    public async Task<IActionResult> ApproveJoin(Guid id, Guid userId)
    {
        var success = await _matchService.ApproveJoinRequestAsync(id, GetUserId(), userId);
        return Ok(new { isSuccess = true, message = "Đã duyệt yêu cầu tham gia!" });
    }

    [HttpPut("{id}/reject/{userId}")]
    [Authorize]
    public async Task<IActionResult> RejectJoin(Guid id, Guid userId)
    {
        var success = await _matchService.RejectJoinRequestAsync(id, GetUserId(), userId);
        return Ok(new { isSuccess = true, message = "Đã từ chối yêu cầu tham gia!" });
    }

    [HttpPost("{id}/leave")]
    [Authorize]
    public async Task<IActionResult> LeaveMatch(Guid id)
    {
        var success = await _matchService.LeaveMatchAsync(id, GetUserId());
        return Ok(new { isSuccess = true, message = "Đã rời trận đấu thành công!" });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> CancelMatch(Guid id)
    {
        var success = await _matchService.CancelMatchAsync(id, GetUserId());
        return Ok(new { isSuccess = true, message = "Đã hủy trận đấu thành công!" });
    }

    [HttpPut("{id}/attendance/{userId}")]
    [Authorize]
    public async Task<IActionResult> UpdateAttendance(Guid id, Guid userId, [FromQuery] string status)
    {
        var success = await _matchService.UpdateAttendanceAsync(id, GetUserId(), userId, status);
        return Ok(new { isSuccess = true, message = $"Cập nhật trạng thái điểm danh thành công: {status}!" });
    }

    [HttpPost("{id}/external-player")]
    [Authorize]
    public async Task<IActionResult> AddExternalPlayer(Guid id, [FromQuery] string playerName)
    {
        var result = await _matchService.AddExternalPlayerAsync(id, GetUserId(), playerName);
        return Ok(new { isSuccess = true, message = "Thêm thành viên ngoài thành công!", data = result });
    }
}
