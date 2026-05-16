using System.ComponentModel.DataAnnotations;

namespace SportConnect.Application.DTOs.Auth;

public class ChangePasswordDto
{
    public string? OldPassword { get; set; }

    [Required]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters long.")]
    public string NewPassword { get; set; } = string.Empty;
}
