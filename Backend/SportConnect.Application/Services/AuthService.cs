using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SportConnect.Application.DTOs.Auth;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;

    public AuthService(IUnitOfWork unitOfWork, IConfiguration config)
    {
        _unitOfWork = unitOfWork;
        _config = config;
    }

    public async Task<string> LoginAsync(LoginDto loginDto)
    {
        var users = await _unitOfWork.Repository<User>().FindAsync(u => 
            u.Username == loginDto.UsernameOrEmail || u.Email == loginDto.UsernameOrEmail);
        
        var user = users.FirstOrDefault();

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new Exception("Invalid username/email or password.");
        }

        return GenerateJwtToken(user);
    }

    public async Task<bool> RegisterAsync(RegisterDto registerDto)
    {
        var existingUsers = await _unitOfWork.Repository<User>().FindAsync(u => 
            u.Username == registerDto.Username || u.Email == registerDto.Email);
            
        if (existingUsers.Any())
        {
            throw new Exception("Username or Email already exists.");
        }

        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FullName = registerDto.FullName,
            Phone = registerDto.Phone
        };

        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<string> GoogleLoginAsync(GoogleLoginDto googleLoginDto)
    {
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", googleLoginDto.Token);

        var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception("Invalid Google token.");
        }

        var content = await response.Content.ReadAsStringAsync();
        var payload = JsonSerializer.Deserialize<JsonElement>(content);

        var email = payload.GetProperty("email").GetString();
        var name = payload.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : string.Empty;
        var picture = payload.TryGetProperty("picture", out var picProp) ? picProp.GetString() : string.Empty;

        if (string.IsNullOrEmpty(email))
        {
            throw new Exception("Google token did not contain an email.");
        }

        var existingUsers = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == email);
        var user = existingUsers.FirstOrDefault();

        if (user == null)
        {
            user = new User
            {
                Username = email.Split('@')[0] + Guid.NewGuid().ToString().Substring(0, 4),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Random password
                FullName = name,
                AvatarUrl = picture,
                Status = true
            };
            await _unitOfWork.Repository<User>().AddAsync(user);
            await _unitOfWork.CompleteAsync();
        }

        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryMinutes"])),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
