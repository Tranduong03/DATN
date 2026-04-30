namespace SportConnect.Core.Entities;

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BookingId { get; set; }
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

    // Navigation properties
    public Booking Booking { get; set; } = null!;
    public User Host { get; set; } = null!;
    public ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
}