namespace SportConnect.Core.Entities;

public class ActivityLog
{
    public Guid Id            { get; set; } = Guid.NewGuid();
    public Guid ActorId       { get; set; }
    public string ActorRole   { get; set; } = string.Empty;
    public string Action      { get; set; } = string.Empty;
    public string TargetType  { get; set; } = string.Empty;
    public string TargetId    { get; set; } = string.Empty;
    public string OldValue    { get; set; } = string.Empty; // JSON
    public string NewValue    { get; set; } = string.Empty; // JSON
    public string IpAddress   { get; set; } = string.Empty;
    public string UserAgent   { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public User Actor { get; set; } = null!;
}