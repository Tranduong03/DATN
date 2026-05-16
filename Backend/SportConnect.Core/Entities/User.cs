namespace SportConnect.Core.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public double TrustScore { get; set; } = 5.0;
    public int NoShowCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool Status { get; set; } = true;

    // Navigation properties (Liên kết bảng)
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<Venue> OwnedVenues { get; set; } = new List<Venue>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Match> HostedMatches { get; set; } = new List<Match>();
    public ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
}