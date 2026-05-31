namespace SportConnect.Core.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid VenueId { get; set; }
    public Guid BookingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Venue Venue { get; set; } = null!;
    public Booking Booking { get; set; } = null!;
}
