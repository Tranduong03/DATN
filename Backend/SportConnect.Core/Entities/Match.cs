namespace SportConnect.Core.Entities;

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? BookingId { get; set; }
    public Guid HostId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? SkillLevel { get; set; } // Ví dụ: BEGINNER, INTERMEDIATE, ADVANCED
    public int MaxPlayers { get; set; }
    public decimal FeePerPlayer { get; set; }

    /// <summary>
    /// Trạng thái: OPEN, FULL, COMPLETED, CANCELLED
    /// </summary>
    public string Status { get; set; } = "OPEN";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Manual details for external venues (used if BookingId is null)
    public string? CustomVenueName { get; set; }
    public string? CustomCourtName { get; set; }
    public DateTime? CustomStartTime { get; set; }
    public DateTime? CustomEndTime { get; set; }
    public string? SportType { get; set; }

    // Navigation properties
    public Booking? Booking { get; set; }
    public User Host { get; set; } = null!;
    public ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
}