namespace SportConnect.Core.Entities;

public class VenueImage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VenueId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string ImageType { get; set; } = "Gallery"; // Avatar, Gallery, Logo

    public Venue Venue { get; set; } = null!;
}
