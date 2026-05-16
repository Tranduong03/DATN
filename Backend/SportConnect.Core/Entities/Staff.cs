namespace SportConnect.Core.Entities;

public class StaffVenuePermission
{
    public Guid StaffUserId   { get; set; }
    public Guid VenueId       { get; set; }
    public string Permission  { get; set; } = string.Empty;
    public Guid GrantedBy     { get; set; }
    public DateTime GrantedAt { get; set; } = DateTime.Now;
    public User Staff   { get; set; } = null!;
    public Venue Venue  { get; set; } = null!;
    public User Granter { get; set; } = null!;
}