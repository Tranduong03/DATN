using System;

namespace SportConnect.Core.Entities;

public class TeamMember
{
    public Guid TeamId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "MEMBER"; // CAPTAIN, MEMBER
    public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Team Team { get; set; } = null!;
    public User User { get; set; } = null!;
}
