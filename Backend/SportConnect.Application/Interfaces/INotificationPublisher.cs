namespace SportConnect.Application.Interfaces;

public interface INotificationPublisher
{
    Task SendNotificationToUserAsync(Guid userId, string message);
}
