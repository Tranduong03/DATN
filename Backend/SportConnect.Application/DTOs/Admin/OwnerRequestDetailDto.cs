namespace SportConnect.Application.DTOs.Admin;

public class OwnerRequestDetailDto
{
    // Thông tin user
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public double TrustScore { get; set; }
    public DateTime UserCreatedAt { get; set; }

    // Trạng thái onboarding
    public string VerificationStatus { get; set; } = "Pending";
    public string OnboardingStatus { get; set; } = string.Empty;
    public string? RejectReason { get; set; }
    public DateTime SubmittedAt { get; set; }

    // Thông tin Venue
    public Guid? VenueId { get; set; }
    public string? VenueName { get; set; }
    public string? VenueAddress { get; set; }
    public string? VenuePhone { get; set; }
    public string? Description { get; set; }
    public string? OperatingStartHour { get; set; }
    public string? OperatingEndHour { get; set; }
    public List<string> SportTypes { get; set; } = new();
    public int VenueScale { get; set; }
    public string? VenueStatus { get; set; }
    public List<string> VenueImages { get; set; } = new();

    // Raw draft data (JSON)
    public string? DraftData { get; set; }
}
