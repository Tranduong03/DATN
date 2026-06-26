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
    public double TrustScore { get; set; } = 100.0;
    public int NoShowCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool Status { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Physical metrics & Personalization profile
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public string? SpecialNotes { get; set; }
    public string? FavPosition { get; set; }
    public string? SportsLevel { get; set; }
    public string? Goals { get; set; }
    public string? Frequency { get; set; }
    public string? PreferredSports { get; set; } // JSON list of preferred sports
    public string? PreferredLocations { get; set; } // JSON list of preferred locations/districts

    // Navigation properties (Liên kết bảng)
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<Venue> OwnedVenues { get; set; } = new List<Venue>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Match> HostedMatches { get; set; } = new List<Match>();
    public ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<FavoriteVenue> FavoriteVenues { get; set; } = new List<FavoriteVenue>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Team> CreatedTeams { get; set; } = new List<Team>();
    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
}