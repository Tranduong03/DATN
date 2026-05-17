namespace SportConnect.Application.DTOs.Admin;

public class OwnerRequestDto
{
    public Guid UserId { get; set; }
    public string? FullName { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string VerificationStatus { get; set; } = "Pending";
    public DateTime SubmittedAt { get; set; }
    public string? VenueName { get; set; }
    public string? VenueAddress { get; set; }
}
