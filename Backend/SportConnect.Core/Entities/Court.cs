namespace SportConnect.Core.Entities;

public class Court
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VenueId { get; set; }
    public string CourtName { get; set; } = string.Empty; // Ví dụ: Sân số 1, Sân VIP
    public string Status { get; set; } = "AVAILABLE"; // AVAILABLE, MAINTENANCE
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Venue Venue { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}