using Microsoft.AspNetCore.SignalR;
using SportConnect.API.Hubs;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Services;

public class SignalRNotificationPublisher : INotificationPublisher
{
    private readonly IHubContext<NotificationHub> _hubContext;
    
    public SignalRNotificationPublisher(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }
    
    public async Task SendNotificationToUserAsync(Guid userId, string message)
    {
        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", message);
    }
}
