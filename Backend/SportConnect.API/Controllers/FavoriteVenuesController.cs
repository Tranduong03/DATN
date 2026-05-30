using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FavoriteVenuesController : ControllerBase
{
    private readonly IFavoriteVenueService _favoriteVenueService;

    public FavoriteVenuesController(IFavoriteVenueService favoriteVenueService)
    {
        _favoriteVenueService = favoriteVenueService;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idStr, out var id) ? id : Guid.Empty;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var favorites = await _favoriteVenueService.GetFavoriteVenuesAsync(userId);
        return Ok(new { isSuccess = true, data = favorites });
    }

    [HttpPost("{venueId}/toggle")]
    public async Task<IActionResult> ToggleFavorite(Guid venueId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var isFavorite = await _favoriteVenueService.ToggleFavoriteAsync(userId, venueId);
        return Ok(new { isSuccess = true, data = new { isFavorite } });
    }

    [HttpGet("{venueId}/check")]
    public async Task<IActionResult> CheckIsFavorite(Guid venueId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var isFavorite = await _favoriteVenueService.IsFavoriteAsync(userId, venueId);
        return Ok(new { isSuccess = true, data = new { isFavorite } });
    }
}
