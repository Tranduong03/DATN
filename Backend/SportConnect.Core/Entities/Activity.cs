namespace SportConnect.Core.Entities;

public class ActivityLog
{
    public Guid Id            { get; set; } = Guid.NewGuid();
    public Guid ActorId       { get; set; }
    public string ActorRole   { get; set; }
    public string Action      { get; set; }
    public string TargetType  { get; set; }
    public string TargetId    { get; set; }
    public string OldValue    { get; set; } // JSON
    public string NewValue    { get; set; } // JSON
    public string IpAddress   { get; set; }
    public string UserAgent   { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public User Actor { get; set; }
}