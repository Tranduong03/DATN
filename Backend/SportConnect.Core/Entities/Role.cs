namespace SportConnect.Core.Entities;

public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}