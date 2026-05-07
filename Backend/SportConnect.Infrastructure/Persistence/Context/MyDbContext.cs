using Microsoft.EntityFrameworkCore;
using SportConnect.Core.Entities;

namespace SportConnect.Infrastructure.Persistence.Context;

public class MyDbContext(DbContextOptions<MyDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<PriceRule> PriceRules => Set<PriceRule>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchPlayer> MatchPlayers => Set<MatchPlayer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==========================================
        // 1. CẤU HÌNH BẢNG NGƯỜI DÙNG & PHÂN QUYỀN
        // ==========================================
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.Username)
                .HasColumnName("username")
                .HasMaxLength(255)
                .IsRequired();

            entity.HasIndex(e => e.Username)
                .IsUnique();

            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            entity.HasIndex(e => e.Email)
                .IsUnique();

            entity.Property(e => e.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.FullName)
                .HasColumnName("full_name")
                .HasMaxLength(255);

            entity.Property(e => e.Phone)
                .HasColumnName("phone")
                .HasMaxLength(50);

            entity.Property(e => e.AvatarUrl)
                .HasColumnName("avatar_url");

            entity.Property(e => e.TrustScore)
                .HasColumnName("trust_score")
                .HasDefaultValue(5.0);

            entity.Property(e => e.NoShowCount)
                .HasColumnName("no_show_count")
                .HasDefaultValue(0);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasDefaultValue(true);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.RoleName)
                .HasColumnName("role_name")
                .HasMaxLength(50)
                .IsRequired();

            entity.HasIndex(e => e.RoleName)
                .IsUnique();

            entity.Property(e => e.Description)
                .HasColumnName("description")
                .HasMaxLength(255);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("User_Role");

            entity.HasKey(e => new { e.UserId, e.RoleId });

            entity.Property(e => e.UserId)
                .HasColumnName("user_id");

            entity.Property(e => e.RoleId)
                .HasColumnName("role_id");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("Permissions");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.PermissionCode)
                .HasColumnName("permission_code")
                .HasMaxLength(255)
                .IsRequired();

            entity.HasIndex(e => e.PermissionCode)
                .IsUnique();

            entity.Property(e => e.PermissionName)
                .HasColumnName("permission_name")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasColumnName("description");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("Role_Permission");

            entity.HasKey(e => new { e.RoleId, e.PermissionId });

            entity.Property(e => e.RoleId)
                .HasColumnName("role_id");

            entity.Property(e => e.PermissionId)
                .HasColumnName("permission_id");
        });

        // ==========================================
        // 2. CẤU HÌNH BẢNG SÂN BÃI & ĐẶT LỊCH
        // ==========================================
        modelBuilder.Entity<Venue>(entity =>
        {
            entity.ToTable("Venues");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.OwnerId)
                .HasColumnName("owner_id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Address)
                .HasColumnName("address")
                .IsRequired();

            entity.Property(e => e.BankQrUrl)
                .HasColumnName("bank_qr_url");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .HasDefaultValue("ACTIVE");
        });

        modelBuilder.Entity<Court>(entity =>
        {
            entity.ToTable("Courts");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.VenueId)
                .HasColumnName("venue_id");

            entity.Property(e => e.CourtName)
                .HasColumnName("court_name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .HasDefaultValue("AVAILABLE");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETDATE()");
        });

        modelBuilder.Entity<PriceRule>(entity =>
        {
            entity.ToTable("PriceRules");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.VenueId)
                .HasColumnName("venue_id");

            entity.Property(e => e.DayOfWeek)
                .HasColumnName("day_of_week");

            entity.Property(e => e.StartHour)
                .HasColumnName("start_hour");

            entity.Property(e => e.EndHour)
                .HasColumnName("end_hour");

            entity.Property(e => e.Price)
                .HasColumnName("price")
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Description)
                .HasColumnName("description")
                .HasMaxLength(255);

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.PriceRules)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.ToTable("Bookings");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.BookerId)
                .HasColumnName("booker_id");

            entity.Property(e => e.CourtId)
                .HasColumnName("court_id");

            entity.Property(e => e.StartTime)
                .HasColumnName("start_time");

            entity.Property(e => e.EndTime)
                .HasColumnName("end_time");

            entity.Property(e => e.TotalPrice)
                .HasColumnName("total_price")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(b => b.Booker)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.BookerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ==========================================
        // 3. CẤU HÌNH BẢNG KÈO ĐẤU (MATCHES)
        // ==========================================
        modelBuilder.Entity<Match>(entity =>
        {
            entity.ToTable("Matches");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.BookingId)
                .HasColumnName("booking_id");

            entity.Property(e => e.HostId)
                .HasColumnName("host_id");

            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.SkillLevel)
                .HasColumnName("skill_level")
                .HasMaxLength(50);

            entity.Property(e => e.MaxPlayers)
                .HasColumnName("max_players");

            entity.Property(e => e.FeePerPlayer)
                .HasColumnName("fee_per_player")
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .HasDefaultValue("OPEN");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETDATE()");

            // Quan hệ 1-1 với Booking
            entity.HasOne(m => m.Booking)
                .WithOne(b => b.Match)
                .HasForeignKey<Match>(m => m.BookingId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ Host
            entity.HasOne(m => m.Host)
                .WithMany(u => u.HostedMatches)
                .HasForeignKey(m => m.HostId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MatchPlayer>(entity =>
        {
            entity.ToTable("Match_Players");

            entity.HasKey(e => new { e.MatchId, e.UserId });

            entity.Property(e => e.MatchId)
                .HasColumnName("match_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id");

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .HasDefaultValue("PENDING");

            entity.Property(e => e.JoinedAt)
                .HasColumnName("joined_at")
                .HasDefaultValueSql("GETDATE()");
        });
    }
}