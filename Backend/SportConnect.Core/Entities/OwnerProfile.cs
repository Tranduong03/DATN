namespace SportConnect.Core.Entities;

public class OwnerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    
    // NotStarted, InProgress, Completed
    public string OnboardingStatus { get; set; } = "NotStarted";
    
    // Pending, Verified, Rejected, None
    public string VerificationStatus { get; set; } = "None";
    
    public int CurrentStep { get; set; } = 1;
    
    // JSON string containing draft data
    public string? DraftData { get; set; }
    
    public string? RejectReason { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
