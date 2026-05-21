using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SportConnect.Infrastructure.Persistence.Context;
using SportConnect.Application.Interfaces;
using SportConnect.Application.Services;
using SportConnect.Infrastructure.Services;
using SportConnect.Infrastructure.Persistence.Repositories;
using System.Text;
using Microsoft.OpenApi.Models;
using SportConnect.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ==================== SERVICES ====================

// Database
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories & UnitOfWork
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOwnerOnboardingService, OwnerOnboardingService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IOwnerVenueService, OwnerVenueService>();
builder.Services.AddScoped<IPublicVenueService, PublicVenueService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ISportCategoryService, SportCategoryService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<StaffPermissionService>();
builder.Services.AddScoped<ActivityLogService>();
builder.Services.AddHttpContextAccessor();

// Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Input JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

builder.Services.AddAuthorization();

// CORS — cho phép Frontend gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy
            .WithOrigins(
                "http://localhost:5173",   // Vite dev server
                "http://localhost:3000",   // CRA dev server (dự phòng)
                "https://sportconnect.vercel.app" // Production domain (cập nhật sau)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// ==================== BUILD ====================
var app = builder.Build();

// ==================== MIDDLEWARE ====================

// 1. Global Exception Handler — phải là ĐẦUTIÊN để bắt tất cả exception
app.UseMiddleware<GlobalExceptionMiddleware>();

// 2. Swagger (chỉ development)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 3. CORS — phải trước Authentication
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthentication(); // ← phải trước UseAuthorization
app.UseAuthorization();
app.MapControllers();

// ==================== RUN ====================
app.Run();