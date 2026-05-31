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
        var venues = await _ownerVenueService.GetMyVenuesAsync(GetUserId());
        return Ok(new { isSuccess = true, data = venues });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVenueDetail(Guid id)
    {
        var venue = await _ownerVenueService.GetVenueDetailAsync(id, GetUserId());
        if (venue == null) return NotFound(new { isSuccess = false, message = "Venue not found or access denied." });
        return Ok(new { isSuccess = true, data = venue });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVenue(Guid id, [FromBody] UpdateVenueDto dto)
    {
        var venue = await _ownerVenueService.UpdateVenueAsync(id, GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Cập nhật thông tin cơ sở thành công.", data = venue });
    }

    // --- Venue Images Management ---

    [HttpPost("{id}/images")]
    public async Task<IActionResult> AddVenueImage(Guid id, [FromBody] AddVenueImageDto dto)
    {
        var img = await _ownerVenueService.AddVenueImageAsync(id, GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Thêm hình ảnh thành công.", data = img });
    }

    [HttpDelete("{id}/images/{imageId}")]
    public async Task<IActionResult> DeleteVenueImage(Guid id, Guid imageId)
    {
        await _ownerVenueService.DeleteVenueImageAsync(id, GetUserId(), imageId);
        return Ok(new { isSuccess = true, message = "Xóa hình ảnh thành công." });
    }

    // --- Courts Management ---

    [HttpGet("{id}/courts")]
    public async Task<IActionResult> GetCourts(Guid id)
    {
        var courts = await _ownerVenueService.GetCourtsAsync(id, GetUserId());
        return Ok(new { isSuccess = true, data = courts });
    }

    [HttpPost("{id}/courts")]
    public async Task<IActionResult> AddCourt(Guid id, [FromBody] CreateCourtDto dto)
    {
        var court = await _ownerVenueService.AddCourtAsync(id, GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Thêm sân con thành công.", data = court });
    }

    [HttpPut("{id}/courts/{courtId}")]
    public async Task<IActionResult> UpdateCourt(Guid id, Guid courtId, [FromBody] UpdateCourtDto dto)
    {
        var court = await _ownerVenueService.UpdateCourtAsync(id, courtId, GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Cập nhật trạng thái sân con thành công.", data = court });
    }

    // --- Pricing Rules Management ---

    [HttpGet("{id}/pricerules")]
    public async Task<IActionResult> GetPriceRules(Guid id)
    {
        var rules = await _ownerVenueService.GetPriceRulesAsync(id, GetUserId());
        return Ok(new { isSuccess = true, data = rules });
    }

    [HttpPost("{id}/pricerules")]
    public async Task<IActionResult> UpsertPriceRules(Guid id, [FromBody] List<UpsertPriceRuleDto> dtos)
    {
        await _ownerVenueService.UpsertPriceRulesAsync(id, GetUserId(), dtos);
        return Ok(new { isSuccess = true, message = "Cập nhật bảng giá thành công." });
    }
}
