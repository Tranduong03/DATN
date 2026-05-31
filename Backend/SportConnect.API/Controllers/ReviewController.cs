using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/reviews")]
[ApiController]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet("venue/{venueId}")]
    public async Task<IActionResult> GetVenueReviews(Guid venueId)
    {
        var reviews = await _reviewService.GetVenueReviewsAsync(venueId);
        return Ok(new { isSuccess = true, data = reviews });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        try
        {
            var review = await _reviewService.CreateReviewAsync(GetUserId(), dto);
            return Ok(new { isSuccess = true, message = "Đánh giá thành công!", data = review });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }
}
