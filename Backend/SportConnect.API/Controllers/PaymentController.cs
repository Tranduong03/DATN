using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SportConnect.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PaymentController : ControllerBase
{
    private readonly IVnPayService _vnPayService;
    private readonly IUnitOfWork _unitOfWork;

    public PaymentController(IVnPayService vnPayService, IUnitOfWork unitOfWork)
    {
        _vnPayService = vnPayService;
        _unitOfWork = unitOfWork;
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return idClaim != null ? Guid.Parse(idClaim) : Guid.Empty;
    }

    [HttpGet("vnpay/{bookingId:guid}")]
    [Authorize]
    public async Task<IActionResult> CreateVnPayUrl(Guid bookingId)
    {
        var booking = await _unitOfWork.Repository<Booking>().GetByIdAsync(bookingId);
        if (booking == null)
        {
            return NotFound(new { isSuccess = false, message = "Không tìm thấy đơn đặt sân." });
        }

        if (booking.BookerId != GetUserId())
        {
            return Forbid();
        }

        if (booking.Status != "PENDING")
        {
            return BadRequest(new { isSuccess = false, message = "Đơn đặt sân này không ở trạng thái chờ thanh toán." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1")
        {
            ipAddress = "127.0.0.1";
        }

        var url = _vnPayService.CreatePaymentUrl(booking, ipAddress);
        return Ok(new { isSuccess = true, paymentUrl = url });
    }

    [HttpGet("vnpay-callback")]
    public async Task<IActionResult> VnPayCallback()
    {
        var queryParams = new Dictionary<string, string>();
        foreach (var key in Request.Query.Keys)
        {
            queryParams[key] = Request.Query[key].ToString();
        }

        var response = _vnPayService.ExecutePayment(queryParams);
        
        if (response.Success && Guid.TryParse(response.OrderId, out var bookingId))
        {
            var booking = await _unitOfWork.Repository<Booking>().GetByIdAsync(bookingId);
            if (booking != null && booking.Status == "PENDING")
            {
                booking.Status = "CONFIRMED";
                booking.ReceiptUrl = response.TransactionId; // Lưu mã giao dịch VNPay làm receipt
                _unitOfWork.Repository<Booking>().Update(booking);
                await _unitOfWork.CompleteAsync();
            }
            
            // Điều hướng về giao diện kết quả của Frontend
            var frontendUrl = $"http://localhost:5173/payment-result?status=success&bookingId={bookingId}";
            return Redirect(frontendUrl);
        }
        else
        {
            var frontendUrl = $"http://localhost:5173/payment-result?status=fail&bookingId={response.OrderId}";
            return Redirect(frontendUrl);
        }
    }
}
