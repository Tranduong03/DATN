using SportConnect.Application.DTOs.Admin;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Exceptions;

namespace SportConnect.Application.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;

    public AdminService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<(List<UserListItemDto> Items, int TotalCount)> GetAllUsersAsync(
        string? search, int page, int pageSize)
    {
        return await _adminRepository.GetAllUsersAsync(search, page, pageSize);
    }

    public async Task<List<OwnerRequestDto>> GetOwnerRequestsAsync(string? statusFilter)
    {
        return await _adminRepository.GetOwnerRequestsAsync(statusFilter);
    }

    public async Task<OwnerRequestDetailDto?> GetOwnerRequestDetailAsync(Guid userId)
    {
        var detail = await _adminRepository.GetOwnerRequestDetailAsync(userId);
        if (detail == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin yêu cầu của người dùng này.");
        }
        return detail;
    }

    public async Task<bool> ApproveOwnerAsync(Guid userId)
    {
        var success = await _adminRepository.ApproveOwnerAsync(userId);
        if (!success)
        {
            throw new NotFoundException("Không tìm thấy hồ sơ yêu cầu làm chủ sân của người dùng.");
        }
        return true;
    }

    public async Task<bool> RejectOwnerAsync(Guid userId, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new BadRequestException("Vui lòng cung cấp lý do từ chối.");
        }

        var success = await _adminRepository.RejectOwnerAsync(userId, reason);
        if (!success)
        {
            throw new NotFoundException("Không tìm thấy hồ sơ yêu cầu làm chủ sân của người dùng.");
        }
        return true;
    }

    public async Task<bool> ToggleUserStatusAsync(Guid userId)
    {
        var success = await _adminRepository.ToggleUserStatusAsync(userId);
        if (!success)
        {
            throw new NotFoundException("Không tìm thấy thông tin người dùng.");
        }
        return true;
    }
}
