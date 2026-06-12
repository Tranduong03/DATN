using System;
using System.Collections.Generic;

namespace SportConnect.Application.DTOs.Team;

public class CreateTeamDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SportType { get; set; }
    public string? AvatarUrl { get; set; }
    public string? SkillLevel { get; set; }
    public string? Location { get; set; }
}

public class UpdateTeamDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SportType { get; set; }
    public string? AvatarUrl { get; set; }
    public string? SkillLevel { get; set; }
    public string? Location { get; set; }
}

public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SportType { get; set; }
    public string? AvatarUrl { get; set; }
    public Guid CreatorId { get; set; }
    public string CreatorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? SkillLevel { get; set; }
    public string? Location { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public int MemberCount { get; set; }
    public List<TeamMemberDto> Members { get; set; } = new();
}

public class TeamMemberDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}
