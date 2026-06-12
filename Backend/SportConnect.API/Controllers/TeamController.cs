using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.Team;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/teams")]
[ApiController]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTeams([FromQuery] string? sportType, [FromQuery] string? skillLevel)
    {
        var teams = await _teamService.GetAllTeamsAsync(sportType, skillLevel);
        return Ok(new { isSuccess = true, data = teams });
    }

    [HttpGet("my-teams")]
    [Authorize]
    public async Task<IActionResult> GetMyTeams()
    {
        var teams = await _teamService.GetUserTeamsAsync(GetUserId());
        return Ok(new { isSuccess = true, data = teams });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTeam(Guid id)
    {
        var team = await _teamService.GetTeamByIdAsync(id);
        if (team == null) return NotFound(new { isSuccess = false, message = "Team not found" });
        return Ok(new { isSuccess = true, data = team });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDto dto)
    {
        var team = await _teamService.CreateTeamAsync(GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Tạo đội/nhóm thành công!", data = team });
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateTeam(Guid id, [FromBody] UpdateTeamDto dto)
    {
        var team = await _teamService.UpdateTeamAsync(id, GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Cập nhật đội/nhóm thành công!", data = team });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteTeam(Guid id)
    {
        var success = await _teamService.DeleteTeamAsync(id, GetUserId());
        return Ok(new { isSuccess = true, message = "Xóa đội/nhóm thành công!" });
    }

    [HttpPost("{id}/join")]
    [Authorize]
    public async Task<IActionResult> JoinTeam(Guid id)
    {
        var success = await _teamService.JoinTeamAsync(id, GetUserId());
        return Ok(new { isSuccess = true, message = "Đã gửi yêu cầu tham gia đội/nhóm!" });
    }

    [HttpPost("{id}/leave")]
    [Authorize]
    public async Task<IActionResult> LeaveTeam(Guid id)
    {
        var success = await _teamService.LeaveTeamAsync(id, GetUserId());
        return Ok(new { isSuccess = true, message = "Đã rời đội/nhóm thành công!" });
    }

    [HttpPut("{id}/approve/{memberId}")]
    [Authorize]
    public async Task<IActionResult> ApproveMember(Guid id, Guid memberId)
    {
        var success = await _teamService.ApproveMemberAsync(id, GetUserId(), memberId);
        return Ok(new { isSuccess = true, message = "Đã duyệt thành viên thành công!" });
    }

    [HttpPut("{id}/reject/{memberId}")]
    [Authorize]
    public async Task<IActionResult> RejectMember(Guid id, Guid memberId)
    {
        var success = await _teamService.RejectMemberAsync(id, GetUserId(), memberId);
        return Ok(new { isSuccess = true, message = "Đã từ chối yêu cầu gia nhập!" });
    }
}
