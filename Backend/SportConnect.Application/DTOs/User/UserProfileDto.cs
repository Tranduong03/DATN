using System;

namespace SportConnect.Application.DTOs.User;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public string? SpecialNotes { get; set; }
    public string? FavPosition { get; set; }
    public string? SportsLevel { get; set; }
    public string? Goals { get; set; }
    public string? Frequency { get; set; }
    public string? PreferredSports { get; set; }
    public string? PreferredLocations { get; set; }
}
