namespace SportConnect.Core.Entities;

public class MatchPlayer
{
    public Guid MatchId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Trạng thái: PENDING, APPROVED, REJECTED, NO_SHOW
    /// </summary>
    public string Status { get; set; } = "PENDING";

    // Navigation properties
    public Match Match { get; set; } = null!;
    public User User { get; set; } = null!;
}