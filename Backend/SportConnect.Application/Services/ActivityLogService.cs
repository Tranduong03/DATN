namespace SportConnect.Application.Services;

using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SportConnect.Core.Entities;
using SportConnect.Infrastructure.Persistence.Context;

public class ActivityLogService
{
    private readonly ApplicationDbContext _db;
    private readonly IHttpContextAccessor _http;

    public ActivityLogService(ApplicationDbContext db, IHttpContextAccessor http)
    { _db = db; _http = http; }

    public async Task LogAsync(Guid actorId, string actorRole,
        string action, string targetType, string targetId,
        object oldValue = null, object newValue = null)
    {
        _db.ActivityLogs.Add(new ActivityLog
        {
            ActorId    = actorId,
            ActorRole  = actorRole,
            Action     = action,
            TargetType = targetType,
            TargetId   = targetId,
            OldValue   = oldValue != null ? JsonSerializer.Serialize(oldValue) : null,
            NewValue   = newValue != null ? JsonSerializer.Serialize(newValue) : null,
            IpAddress  = _http.HttpContext?.Connection?.RemoteIpAddress?.ToString(),
            UserAgent  = _http.HttpContext?.Request?.Headers["User-Agent"]
        });
        await _db.SaveChangesAsync();
    }
}