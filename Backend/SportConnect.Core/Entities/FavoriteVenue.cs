namespace SportConnect.Core.Entities;

public class FavoriteVenue
{
    public Guid UserId { get; set; }
    public Guid VenueId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Venue Venue { get; set; } = null!;
}
