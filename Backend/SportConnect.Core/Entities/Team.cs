using System;
using System.Collections.Generic;

namespace SportConnect.Core.Entities;

public class Team
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SportType { get; set; }
    public string? AvatarUrl { get; set; }
    public Guid CreatorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? SkillLevel { get; set; } // BEGINNER, INTERMEDIATE, ADVANCED
    public string? Location { get; set; }
    public string Status { get; set; } = "ACTIVE";

    // Navigation properties
    public User Creator { get; set; } = null!;
    public ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
}
