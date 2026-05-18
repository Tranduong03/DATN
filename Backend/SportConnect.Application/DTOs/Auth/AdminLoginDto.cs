namespace SportConnect.Application.DTOs.Auth;

public class AdminLoginDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Admin secret key — phải khớp với AdminSettings:SecretKey trong appsettings
    /// </summary>
    public string AdminKey { get; set; } = string.Empty;
}
