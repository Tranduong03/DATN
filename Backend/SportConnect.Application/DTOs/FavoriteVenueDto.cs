namespace SportConnect.Application.DTOs;

public class FavoriteVenueDto
{
    public Guid VenueId { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public double Rating { get; set; }
    public decimal MinPrice { get; set; }
    public DateTime AddedAt { get; set; }
}
