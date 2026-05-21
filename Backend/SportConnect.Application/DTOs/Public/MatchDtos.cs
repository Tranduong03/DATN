using System;
using System.Collections.Generic;

namespace SportConnect.Application.DTOs.Public;

public class MatchDto
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid HostId { get; set; }
    public string HostName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? SkillLevel { get; set; }
    public int MaxPlayers { get; set; }
    public int CurrentPlayers { get; set; }
    public decimal FeePerPlayer { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Additional info
    public string VenueName { get; set; } = string.Empty;
    public string CourtName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    
    public List<MatchPlayerDto> Players { get; set; } = new();
}

public class MatchPlayerDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}

public class CreateMatchDto
{
    public Guid BookingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? SkillLevel { get; set; }
    public int MaxPlayers { get; set; }
    public decimal FeePerPlayer { get; set; }
}
