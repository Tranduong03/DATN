namespace SportConnect.Application.DTOs.OwnerOnboarding;

public class OnboardingStatusDto
{
    public string OnboardingStatus { get; set; } = "NotStarted";
    public string VerificationStatus { get; set; } = "None";
    public int CurrentStep { get; set; } = 1;
    public string? DraftData { get; set; }
    public string? RejectReason { get; set; }
}
