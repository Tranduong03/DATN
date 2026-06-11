namespace SportConnect.Core.Entities;

public class Venue
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? BankQrUrl { get; set; }
    public string? ContactPhone { get; set; }
    public string? Description { get; set; }
    public TimeSpan OperatingStartHour { get; set; }
    public TimeSpan OperatingEndHour { get; set; }
    public List<string> SportTypes { get; set; } = new();
    public int VenueScale { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE, PENDING_APPROVAL
    public double AverageRating { get; set; } = 5.0;
    public int ReviewCount { get; set; } = 0;

    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<Court> Courts { get; set; } = new List<Court>();
    public ICollection<PriceRule> PriceRules { get; set; } = new List<PriceRule>();
    public ICollection<VenueImage> Images { get; set; } = new List<VenueImage>();
    public ICollection<FavoriteVenue> FavoritedByUsers { get; set; } = new List<FavoriteVenue>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}