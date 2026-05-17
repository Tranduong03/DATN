using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Constants;

namespace SportConnect.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = AppRoles.Admin)]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    /// <summary>
    /// Lấy danh sách tất cả người dùng (có phân trang và tìm kiếm)
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var (items, total) = await _adminService.GetAllUsersAsync(search, page, pageSize);
            return Ok(new
            {
                isSuccess = true,
                data = new
                {
                    items,
                    totalCount = total,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)total / pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách yêu cầu nâng cấp Owner (lọc theo status)
    /// </summary>
    [HttpGet("owner-requests")]
    public async Task<IActionResult> GetOwnerRequests([FromQuery] string? status = null)
    {
        try
        {
            var requests = await _adminService.GetOwnerRequestsAsync(status);
            return Ok(new { isSuccess = true, data = requests });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Xem chi tiết một yêu cầu Owner
    /// </summary>
    [HttpGet("owner-requests/{userId:guid}")]
    public async Task<IActionResult> GetOwnerRequestDetail(Guid userId)
    {
        try
        {
            var detail = await _adminService.GetOwnerRequestDetailAsync(userId);
            if (detail == null)
                return NotFound(new { isSuccess = false, message = "Không tìm thấy yêu cầu." });

            return Ok(new { isSuccess = true, data = detail });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Phê duyệt yêu cầu Owner → gán Role Owner + kích hoạt Venue
    /// </summary>
    [HttpPost("owner-requests/{userId:guid}/approve")]
    public async Task<IActionResult> ApproveOwner(Guid userId)
    {
        try
        {
            await _adminService.ApproveOwnerAsync(userId);
            return Ok(new { isSuccess = true, message = "Đã phê duyệt thành công. Người dùng đã được cấp quyền Owner." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Từ chối yêu cầu Owner
    /// </summary>
    [HttpPost("owner-requests/{userId:guid}/reject")]
    public async Task<IActionResult> RejectOwner(Guid userId, [FromBody] RejectOwnerRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { isSuccess = false, message = "Vui lòng nhập lý do từ chối." });

            await _adminService.RejectOwnerAsync(userId, request.Reason);
            return Ok(new { isSuccess = true, message = "Đã từ chối yêu cầu." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { isSuccess = false, message = ex.Message });
        }
    }
}

public record RejectOwnerRequest(string Reason);
