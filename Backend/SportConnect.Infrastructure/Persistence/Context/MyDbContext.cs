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
        entity.Property(e => e.Username).HasMaxLength(255).IsRequired();
        entity.HasIndex(e => e.Username).IsUnique();
        entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
        entity.HasIndex(e => e.Email).IsUnique();
        entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
        entity.Property(e => e.FullName).HasMaxLength(255);
        entity.Property(e => e.Phone).HasMaxLength(50);
        entity.Property(e => e.TrustScore).HasDefaultValue(5.0);
        entity.Property(e => e.NoShowCount).HasDefaultValue(0);
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
        entity.Property(e => e.Status).HasDefaultValue(true);
    });

    modelBuilder.Entity<Role>(entity =>
    {
        entity.ToTable("Roles");
        entity.Property(e => e.RoleName).HasMaxLength(50).IsRequired();
        entity.HasIndex(e => e.RoleName).IsUnique();
        entity.Property(e => e.Description).HasMaxLength(255);
    });

    modelBuilder.Entity<UserRole>(entity =>
    {
        entity.ToTable("User_Role");
        entity.HasKey(ur => new { ur.UserId, ur.RoleId });
    });

    modelBuilder.Entity<Permission>(entity =>
    {
        entity.ToTable("Permissions");
        entity.Property(e => e.PermissionCode).HasMaxLength(255).IsRequired();
        entity.HasIndex(e => e.PermissionCode).IsUnique();
        entity.Property(e => e.PermissionName).HasMaxLength(255).IsRequired();
    });

    modelBuilder.Entity<RolePermission>(entity =>
    {
        entity.ToTable("Role_Permission");
        entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });
    });

    // ==========================================
    // 2. CẤU HÌNH BẢNG SÂN BÃI & ĐẶT LỊCH
    // ==========================================
    modelBuilder.Entity<Venue>(entity =>
    {
        entity.ToTable("Venues");
        entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
        entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("ACTIVE");
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
    });

    modelBuilder.Entity<Court>(entity =>
    {
        entity.ToTable("Courts");
        entity.Property(e => e.CourtName).HasMaxLength(100).IsRequired();
        entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("AVAILABLE");
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
    });

    modelBuilder.Entity<PriceRule>(entity =>
    {
        entity.ToTable("PriceRules");
        entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
        entity.Property(e => e.Description).HasMaxLength(255);
    });

    modelBuilder.Entity<Booking>(entity =>
    {
        entity.ToTable("Bookings");
        entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)").IsRequired();
        entity.Property(e => e.Status).HasMaxLength(50).IsRequired();
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

        // Chống lỗi Cascade Delete
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
        entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
        entity.Property(e => e.SkillLevel).HasMaxLength(50);
        entity.Property(e => e.FeePerPlayer).HasColumnType("decimal(18,2)").IsRequired();
        entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("OPEN");
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

        // Mối quan hệ 1-1 giữa Match và Booking
        entity.HasOne(m => m.Booking)
              .WithOne(b => b.Match)
              .HasForeignKey<Match>(m => m.BookingId)
              .OnDelete(DeleteBehavior.Restrict);

        // Chống lỗi Cascade Delete
        entity.HasOne(m => m.Host)
              .WithMany(u => u.HostedMatches)
              .HasForeignKey(m => m.HostId)
              .OnDelete(DeleteBehavior.Restrict);
    });

    modelBuilder.Entity<MatchPlayer>(entity =>
    {
        entity.ToTable("Match_Players");
        entity.HasKey(mp => new { mp.MatchId, mp.UserId });
        entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("PENDING");
        entity.Property(e => e.JoinedAt).HasDefaultValueSql("GETDATE()");
    });
  }

    // protected override void OnModelCreating(ModelBuilder modelBuilder)
    // {
    //     base.OnModelCreating(modelBuilder);

    //     // ==========================================
    //     // User
    //     // ==========================================
    //     modelBuilder.Entity<User>(e =>
    //     {
    //         e.HasKey(u => u.Id);
    //         e.HasIndex(u => u.Username).IsUnique();
    //         e.HasIndex(u => u.Email).IsUnique();
    //         e.Property(u => u.TrustScore).HasDefaultValue(5.0);
    //         e.Property(u => u.Status).HasDefaultValue(true);
    //     });

    //     // ==========================================
    //     // Role
    //     // ==========================================
    //     modelBuilder.Entity<Role>(e =>
    //     {
    //         e.HasKey(r => r.Id);
    //         e.HasIndex(r => r.RoleName).IsUnique();
    //     });

    //     // ==========================================
    //     // UserRole (Many-to-Many)
    //     // ==========================================
    //     modelBuilder.Entity<UserRole>(e =>
    //     {
    //         e.HasKey(ur => new { ur.UserId, ur.RoleId });

    //         e.HasOne(ur => ur.User)
    //             .WithMany(u => u.UserRoles)
    //             .HasForeignKey(ur => ur.UserId);

    //         e.HasOne(ur => ur.Role)
    //             .WithMany(r => r.UserRoles)
    //             .HasForeignKey(ur => ur.RoleId);
    //     });

    //     // ==========================================
    //     // Permission
    //     // ==========================================
    //     modelBuilder.Entity<Permission>(e =>
    //     {
    //         e.HasKey(p => p.Id);
    //         e.HasIndex(p => p.PermissionCode).IsUnique();
    //     });

    //     // ==========================================
    //     // RolePermission (Many-to-Many)
    //     // ==========================================
    //     modelBuilder.Entity<RolePermission>(e =>
    //     {
    //         e.HasKey(rp => new { rp.RoleId, rp.PermissionId });

    //         e.HasOne(rp => rp.Role)
    //             .WithMany(r => r.RolePermissions)
    //             .HasForeignKey(rp => rp.RoleId);

    //         e.HasOne(rp => rp.Permission)
    //             .WithMany(p => p.RolePermissions)
    //             .HasForeignKey(rp => rp.PermissionId);
    //     });

    //     // ==========================================
    //     // Venue
    //     // ==========================================
    //     modelBuilder.Entity<Venue>(e =>
    //     {
    //         e.HasKey(v => v.Id);
    //         e.Property(v => v.Status).HasDefaultValue("ACTIVE");

    //         e.HasOne(v => v.Owner)
    //             .WithMany(u => u.OwnedVenues)
    //             .HasForeignKey(v => v.OwnerId);
    //     });

    //     // ==========================================
    //     // Court
    //     // ==========================================
    //     modelBuilder.Entity<Court>(e =>
    //     {
    //         e.HasKey(c => c.Id);
    //         e.Property(c => c.Status).HasDefaultValue("AVAILABLE");

    //         e.HasOne(c => c.Venue)
    //             .WithMany(v => v.Courts)
    //             .HasForeignKey(c => c.VenueId);
    //     });

    //     // ==========================================
    //     // PriceRule
    //     // ==========================================
    //     modelBuilder.Entity<PriceRule>(e =>
    //     {
    //         e.HasKey(pr => pr.Id);
    //         e.Property(pr => pr.Price).HasColumnType("decimal(18,2)");
    //         e.Property(pr => pr.DayOfWeek).IsRequired(false);

    //         e.HasOne(pr => pr.Venue)
    //             .WithMany(v => v.PriceRules)
    //             .HasForeignKey(pr => pr.VenueId);
    //     });

    //     // ==========================================
    //     // Booking
    //     // ==========================================
    //     modelBuilder.Entity<Booking>(e =>
    //     {
    //         e.HasKey(b => b.Id);
    //         e.Property(b => b.TotalPrice).HasColumnType("decimal(18,2)");

    //         e.HasOne(b => b.Booker)
    //             .WithMany(u => u.Bookings)
    //             .HasForeignKey(b => b.BookerId);

    //         e.HasOne(b => b.Court)
    //             .WithMany(c => c.Bookings)
    //             .HasForeignKey(b => b.CourtId);
    //     });

    //     // ==========================================
    //     // Match
    //     // ==========================================
    //     modelBuilder.Entity<Match>(e =>
    //     {
    //         e.HasKey(m => m.Id);
    //         e.Property(m => m.FeePerPlayer).HasColumnType("decimal(18,2)");
    //         e.Property(m => m.Status).HasDefaultValue("OPEN");

    //         // Booking - Match là quan hệ 1-1
    //         e.HasOne(m => m.Booking)
    //             .WithOne(b => b.Match)
    //             .HasForeignKey<Match>(m => m.BookingId);

    //         e.HasOne(m => m.Host)
    //             .WithMany(u => u.HostedMatches)
    //             .HasForeignKey(m => m.HostId);
    //     });

    //     // ==========================================
    //     // MatchPlayer (Many-to-Many)
    //     // ==========================================
    //     modelBuilder.Entity<MatchPlayer>(e =>
    //     {
    //         e.HasKey(mp => new { mp.MatchId, mp.UserId });
    //         e.Property(mp => mp.Status).HasDefaultValue("PENDING");

    //         e.HasOne(mp => mp.Match)
    //             .WithMany(m => m.MatchPlayers)
    //             .HasForeignKey(mp => mp.MatchId);

    //         e.HasOne(mp => mp.User)
    //             .WithMany(u => u.MatchPlayers)
    //             .HasForeignKey(mp => mp.UserId);
    //     });
    // }
}