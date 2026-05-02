using Microsoft.EntityFrameworkCore;
using SportConnect.Infrastructure.Persistence.Context;

var builder = WebApplication.CreateBuilder(args);

// ==================== SERVICES ====================

// Database
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Controllers & API Explorer
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger UI (thay thế cho OpenAPI mặc định)
builder.Services.AddSwaggerGen();

// ==================== BUILD ====================
var app = builder.Build();

// ==================== MIDDLEWARE ====================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // truy cập tại /swagger
}

app.UseHttpsRedirection();
app.MapControllers();

// ==================== RUN ====================
app.Run();