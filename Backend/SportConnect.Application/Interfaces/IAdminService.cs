using SportConnect.Application.DTOs.Admin;

namespace SportConnect.Application.Interfaces;

public interface IAdminService
{
    Task<(List<UserListItemDto> Items, int TotalCount)> GetAllUsersAsync(string? search, int page, int pageSize);
    Task<List<OwnerRequestDto>> GetOwnerRequestsAsync(string? statusFilter);
    Task<OwnerRequestDetailDto?> GetOwnerRequestDetailAsync(Guid userId);
    Task<bool> ApproveOwnerAsync(Guid userId);
    Task<bool> RejectOwnerAsync(Guid userId, string reason);
}
