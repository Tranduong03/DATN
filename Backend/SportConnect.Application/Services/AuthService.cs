using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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
