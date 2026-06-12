namespace SportConnect.Application.DTOs.User;

public class UpdateProfileDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
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
