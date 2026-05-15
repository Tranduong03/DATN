namespace SportConnect.Core.Entities;

public class StaffVenuePermission
{
    public Guid StaffUserId   { get; set; }
    public Guid VenueId       { get; set; }
    public string Permission  { get; set; }
    public Guid GrantedBy     { get; set; }
    public DateTime GrantedAt { get; set; } = DateTime.Now;
    public User Staff   { get; set; }
    public Venue Venue  { get; set; }
    public User Granter { get; set; }
}