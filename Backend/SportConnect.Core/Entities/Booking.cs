namespace SportConnect.Core.Entities;

public class Booking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BookerId { get; set; }
    public Guid CourtId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal TotalPrice { get; set; }
    public string? ReceiptUrl { get; set; }

    /// <summary>
    /// Trạng thái: HOLDING, PENDING, CONFIRMED, CANCELLED
    /// </summary>
    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Booker { get; set; } = null!;
    public Court Court { get; set; } = null!;
    public Match? Match { get; set; }
    public Review? Review { get; set; }
}