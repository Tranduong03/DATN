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

    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<Court> Courts { get; set; } = new List<Court>();
    public ICollection<PriceRule> PriceRules { get; set; } = new List<PriceRule>();
    public ICollection<FavoriteVenue> FavoritedByUsers { get; set; } = new List<FavoriteVenue>();
}