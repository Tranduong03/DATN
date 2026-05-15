namespace SportConnect.Infrastructure.Services;

using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SportConnect.Core.Entities;
using SportConnect.Infrastructure.Persistence.Context;

public class ActivityLogService
{
    private readonly MyDbContext _db;
    private readonly IHttpContextAccessor _http;

    public ActivityLogService(MyDbContext db, IHttpContextAccessor http)
    { 
        _db = db; 
        _http = http; 
    }

    public async Task LogAsync(Guid actorId, string actorRole,
        string action, string targetType, string targetId,
        object? oldValue = null, object? newValue = null)
    {
        _db.ActivityLogs.Add(new ActivityLog
        {
            ActorId    = actorId,
            ActorRole  = actorRole,
            Action     = action,
            TargetType = targetType,
            TargetId   = targetId,
            OldValue   = oldValue != null ? JsonSerializer.Serialize(oldValue) : string.Empty,
            NewValue   = newValue != null ? JsonSerializer.Serialize(newValue) : string.Empty,
            IpAddress  = _http.HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? string.Empty,
            UserAgent  = _http.HttpContext?.Request?.Headers["User-Agent"].ToString() ?? string.Empty
        });
        await _db.SaveChangesAsync();
    }
}
