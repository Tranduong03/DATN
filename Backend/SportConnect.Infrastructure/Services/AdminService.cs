using Microsoft.EntityFrameworkCore;
using SportConnect.Application.DTOs.Admin;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Constants;
using SportConnect.Core.Entities;
using SportConnect.Infrastructure.Persistence.Context;

namespace SportConnect.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly MyDbContext _context;

    public AdminService(MyDbContext context)
    {
        _context = context;
    }

    public async Task<(List<UserListItemDto> Items, int TotalCount)> GetAllUsersAsync(
        string? search, int page, int pageSize)
    {
        var query = _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(s) ||
                u.Email.ToLower().Contains(s) ||
                (u.FullName != null && u.FullName.ToLower().Contains(s)) ||
                (u.Phone != null && u.Phone.Contains(s)));
        }

        var total = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = users.Select(u => new UserListItemDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            Email = u.Email,
            Phone = u.Phone,
            AvatarUrl = u.AvatarUrl,
            Status = u.Status,
            TrustScore = u.TrustScore,
            CreatedAt = u.CreatedAt,
            Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
        }).ToList();

        return (dtos, total);
    }

    public async Task<List<OwnerRequestDto>> GetOwnerRequestsAsync(string? statusFilter)
    {
        var query = _context.OwnerProfiles
            .Include(op => op.User)
            .AsQueryable();

        // Chỉ lấy những đơn đã submit (OnboardingStatus = Completed)
        query = query.Where(op => op.OnboardingStatus == "Completed");

        if (!string.IsNullOrWhiteSpace(statusFilter) && statusFilter != "All")
        {
            query = query.Where(op => op.VerificationStatus == statusFilter);
        }

        var profiles = await query
            .OrderByDescending(op => op.UpdatedAt)
            .ToListAsync();

        var userIds = profiles.Select(p => p.UserId).ToList();
        var venues = await _context.Venues
            .Where(v => userIds.Contains(v.OwnerId))
            .ToListAsync();

        return profiles.Select(op =>
        {
            var venue = venues.FirstOrDefault(v => v.OwnerId == op.UserId);
            return new OwnerRequestDto
            {
                UserId = op.UserId,
                FullName = op.User.FullName,
                Username = op.User.Username,
                Email = op.User.Email,
                AvatarUrl = op.User.AvatarUrl,
                VerificationStatus = op.VerificationStatus,
                SubmittedAt = op.UpdatedAt,
                VenueName = venue?.Name,
                VenueAddress = venue?.Address
            };
        }).ToList();
    }

    public async Task<OwnerRequestDetailDto?> GetOwnerRequestDetailAsync(Guid userId)
    {
        var profile = await _context.OwnerProfiles
            .Include(op => op.User)
            .FirstOrDefaultAsync(op => op.UserId == userId);

        if (profile == null) return null;

        var venue = await _context.Venues
            .FirstOrDefaultAsync(v => v.OwnerId == userId);

        var venueImages = venue != null
            ? await _context.VenueImages
                .Where(vi => vi.VenueId == venue.Id)
                .Select(vi => vi.ImageUrl)
                .ToListAsync()
            : new List<string>();
        return new OwnerRequestDetailDto
        {
            UserId = profile.UserId,
            Username = profile.User.Username,
            FullName = profile.User.FullName,
            Email = profile.User.Email,
            Phone = profile.User.Phone,
            AvatarUrl = profile.User.AvatarUrl,
            TrustScore = profile.User.TrustScore,
            UserCreatedAt = profile.User.CreatedAt,

            VerificationStatus = profile.VerificationStatus,
            OnboardingStatus = profile.OnboardingStatus,
            RejectReason = profile.RejectReason,
            SubmittedAt = profile.UpdatedAt,
            DraftData = profile.DraftData,

            VenueId = venue?.Id,
            VenueName = venue?.Name,
            VenueAddress = venue?.Address,
            VenuePhone = venue?.ContactPhone,
            Description = venue?.Description,
            OperatingStartHour = venue?.OperatingStartHour.ToString(@"hh\:mm"),
            OperatingEndHour = venue?.OperatingEndHour.ToString(@"hh\:mm"),
            SportTypes = venue?.SportTypes ?? new List<string>(),
            VenueScale = venue?.VenueScale ?? 0,
            VenueStatus = venue?.Status,
            VenueImages = venueImages
        };
    }

    public async Task<bool> ApproveOwnerAsync(Guid userId)
    {
        // 1. Cập nhật OwnerProfile
        var profile = await _context.OwnerProfiles
            .FirstOrDefaultAsync(op => op.UserId == userId);
        if (profile == null) throw new Exception("Owner profile not found.");

        profile.VerificationStatus = "Verified";
        profile.UpdatedAt = DateTime.UtcNow;

        // 2. Thêm Role "Owner" vào user (nếu chưa có)
        var ownerRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.RoleName == AppRoles.Owner);
        if (ownerRole == null)
        {
            ownerRole = new Role { RoleName = AppRoles.Owner, Description = "Chủ sân thể thao" };
            _context.Roles.Add(ownerRole);
            await _context.SaveChangesAsync();
        }

        var alreadyHasRole = await _context.UserRoles
            .AnyAsync(ur => ur.UserId == userId && ur.RoleId == ownerRole.Id);
        if (!alreadyHasRole)
        {
            _context.UserRoles.Add(new UserRole { UserId = userId, RoleId = ownerRole.Id });
        }

        // 3. Chuyển Venue từ PENDING_APPROVAL → ACTIVE
        var venue = await _context.Venues
            .FirstOrDefaultAsync(v => v.OwnerId == userId && v.Status == "PENDING_APPROVAL");
        if (venue != null)
        {
            venue.Status = "ACTIVE";
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectOwnerAsync(Guid userId, string reason)
    {
        var profile = await _context.OwnerProfiles
            .FirstOrDefaultAsync(op => op.UserId == userId);
        if (profile == null) throw new Exception("Owner profile not found.");

        profile.VerificationStatus = "Rejected";
        profile.RejectReason = reason;
        profile.UpdatedAt = DateTime.UtcNow;

        // Chuyển Venue → REJECTED (giữ lại data)
        var venue = await _context.Venues
            .FirstOrDefaultAsync(v => v.OwnerId == userId && v.Status == "PENDING_APPROVAL");
        if (venue != null)
        {
            venue.Status = "REJECTED";
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
