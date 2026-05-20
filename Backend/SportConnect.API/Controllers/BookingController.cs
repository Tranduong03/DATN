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

    // This can be public for viewing availability without logging in
    [HttpGet("venues/{venueId}/availability")]
    public async Task<IActionResult> GetAvailability(Guid venueId, [FromQuery] DateTime date)
    {
        try
        {
            var result = await _bookingService.GetAvailabilityAsync(venueId, date);
            return Ok(new { isSuccess = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        try
        {
            var booking = await _bookingService.CreateBookingAsync(GetUserId(), dto);
            return Ok(new { isSuccess = true, message = "Đặt lịch thành công!", data = booking });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    [HttpGet("my-bookings")]
    [Authorize]
    public async Task<IActionResult> GetMyBookings()
    {
        try
        {
            var bookings = await _bookingService.GetMyBookingsAsync(GetUserId());
            return Ok(new { isSuccess = true, data = bookings });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }
}
