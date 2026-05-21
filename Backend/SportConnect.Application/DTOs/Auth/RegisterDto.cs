using System.ComponentModel.DataAnnotations;

namespace SportConnect.Application.DTOs.Auth;

public class RegisterDto
{
    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string? FullName { get; set; }
    public string? Phone { get; set; }
}
