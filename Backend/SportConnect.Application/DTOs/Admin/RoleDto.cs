using System;

namespace SportConnect.Application.DTOs.Admin;

public class RoleDto
{
    public Guid Id { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
}
