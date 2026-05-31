using Microsoft.EntityFrameworkCore;
using SportConnect.Application.DTOs;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;
using SportConnect.Infrastructure.Persistence.Context;

namespace SportConnect.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly MyDbContext _context;
    private readonly INotificationPublisher _publisher;

    public NotificationService(MyDbContext context, INotificationPublisher publisher)
    {
        _context = context;
        _publisher = publisher;
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();
    }

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notif = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        
        if (notif != null && !notif.IsRead)
        {
            notif.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread)
        {
            n.IsRead = true;
        }

        if (unread.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    public async Task CreateNotificationAsync(Guid userId, string title, string message)
    {
        var notif = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notif);
        await _context.SaveChangesAsync();
        
        // Push notification in real-time
        await _publisher.SendNotificationToUserAsync(userId, title);
    }
}
