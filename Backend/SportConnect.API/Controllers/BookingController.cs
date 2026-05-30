using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/bookings")]
[ApiController]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    // Public endpoint for viewing availability without logging in
    [HttpGet("venues/{venueId}/availability")]
    public async Task<IActionResult> GetAvailability(Guid venueId, [FromQuery] DateTime date)
    {
        var result = await _bookingService.GetAvailabilityAsync(venueId, date);
        return Ok(new { isSuccess = true, data = result });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var booking = await _bookingService.CreateBookingAsync(GetUserId(), dto);
        return Ok(new { isSuccess = true, message = "Đặt lịch thành công!", data = booking });
    }

    [HttpGet("my-bookings")]
    [Authorize]
    public async Task<IActionResult> GetMyBookings()
    {
        var bookings = await _bookingService.GetMyBookingsAsync(GetUserId());
        return Ok(new { isSuccess = true, data = bookings });
    }

    // Owner endpoints
    [HttpGet("owner")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> GetOwnerBookings()
    {
        var bookings = await _bookingService.GetOwnerBookingsAsync(GetUserId());
        return Ok(new { isSuccess = true, data = bookings });
    }

    [HttpPut("owner/{id}/status")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] UpdateBookingStatusRequest req)
    {
        var success = await _bookingService.UpdateBookingStatusAsync(id, GetUserId(), req.Status);
        if (!success) return BadRequest(new { isSuccess = false, message = "Không thể cập nhật trạng thái đơn đặt sân" });
        return Ok(new { isSuccess = true, message = "Cập nhật thành công" });
    }

    [HttpGet("owner/stats")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> GetOwnerStats()
    {
        var stats = await _bookingService.GetOwnerDashboardStatsAsync(GetUserId());
        return Ok(new { isSuccess = true, data = stats });
    }
}

public class UpdateBookingStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
