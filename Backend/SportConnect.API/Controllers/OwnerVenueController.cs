using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.Owner;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Constants;

namespace SportConnect.API.Controllers;

[Route("api/owner/venues")]
[ApiController]
[Authorize(Roles = AppRoles.Owner)]
public class OwnerVenueController : ControllerBase
{
    private readonly IOwnerVenueService _ownerVenueService;

    public OwnerVenueController(IOwnerVenueService ownerVenueService)
    {
        _ownerVenueService = ownerVenueService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyVenues()
    {
        try
        {
            var venues = await _ownerVenueService.GetMyVenuesAsync(GetUserId());
            return Ok(new { isSuccess = true, data = venues });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVenueDetail(Guid id)
    {
        try
        {
            var venue = await _ownerVenueService.GetVenueDetailAsync(id, GetUserId());
            if (venue == null) return NotFound(new { isSuccess = false, message = "Venue not found or access denied." });
            return Ok(new { isSuccess = true, data = venue });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    // --- Courts Management ---

    [HttpGet("{id}/courts")]
    public async Task<IActionResult> GetCourts(Guid id)
    {
        try
        {
            var courts = await _ownerVenueService.GetCourtsAsync(id, GetUserId());
            return Ok(new { isSuccess = true, data = courts });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpPost("{id}/courts")]
    public async Task<IActionResult> AddCourt(Guid id, [FromBody] CreateCourtDto dto)
    {
        try
        {
            var court = await _ownerVenueService.AddCourtAsync(id, GetUserId(), dto);
            return Ok(new { isSuccess = true, message = "Thêm sân con thành công.", data = court });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpPut("{id}/courts/{courtId}")]
    public async Task<IActionResult> UpdateCourt(Guid id, Guid courtId, [FromBody] UpdateCourtDto dto)
    {
        try
        {
            var court = await _ownerVenueService.UpdateCourtAsync(id, courtId, GetUserId(), dto);
            return Ok(new { isSuccess = true, message = "Cập nhật trạng thái sân con thành công.", data = court });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    // --- Pricing Rules Management ---

    [HttpGet("{id}/pricerules")]
    public async Task<IActionResult> GetPriceRules(Guid id)
    {
        try
        {
            var rules = await _ownerVenueService.GetPriceRulesAsync(id, GetUserId());
            return Ok(new { isSuccess = true, data = rules });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpPost("{id}/pricerules")]
    public async Task<IActionResult> UpsertPriceRules(Guid id, [FromBody] List<UpsertPriceRuleDto> dtos)
    {
        try
        {
            await _ownerVenueService.UpsertPriceRulesAsync(id, GetUserId(), dtos);
            return Ok(new { isSuccess = true, message = "Cập nhật bảng giá thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }
}
