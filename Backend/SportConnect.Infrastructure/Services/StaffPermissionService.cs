namespace SportConnect.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using SportConnect.Infrastructure.Persistence.Context;

public class StaffPermissionService
{
    private readonly MyDbContext _db;
    public StaffPermissionService(MyDbContext db) => _db = db;

    public async Task<bool> HasPermission(Guid staffUserId, Guid venueId, string code)
        => await _db.StaffVenuePermissions.AnyAsync(x =>
            x.StaffUserId == staffUserId &&
            x.VenueId     == venueId    &&
            x.Permission  == code);
}
