namespace SportConnect.Application.Services;

using Microsoft.EntityFrameworkCore;
using SportConnect.Infrastructure.Persistence.Context;

public class StaffPermissionService
{
    private readonly ApplicationDbContext _db;
    public StaffPermissionService(ApplicationDbContext db) => _db = db;

    public async Task<bool> HasPermission(Guid staffUserId, Guid venueId, string code)
        => await _db.StaffVenuePermissions.AnyAsync(x =>
            x.StaffUserId == staffUserId &&
            x.VenueId     == venueId    &&
            x.Permission  == code);
}