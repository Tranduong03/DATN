using Microsoft.EntityFrameworkCore;
using SportConnect.Core.Entities;

namespace SportConnect.Infrastructure.Persistence.Context;

public class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options)
        : base(options) { }

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
        // User
        // ==========================================
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.TrustScore).HasDefaultValue(5.0);
            e.Property(u => u.Status).HasDefaultValue(true);
        });

        // ==========================================
        // Role
        // ==========================================
        modelBuilder.Entity<Role>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.RoleName).IsUnique();
        });

        // ==========================================
        // UserRole (Many-to-Many)
        // ==========================================
        modelBuilder.Entity<UserRole>(e =>
        {
            e.HasKey(ur => new { ur.UserId, ur.RoleId });

            e.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            e.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);
        });

        // ==========================================
        // Permission
        // ==========================================
        modelBuilder.Entity<Permission>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasIndex(p => p.PermissionCode).IsUnique();
        });

        // ==========================================
        // RolePermission (Many-to-Many)
        // ==========================================
        modelBuilder.Entity<RolePermission>(e =>
        {
            e.HasKey(rp => new { rp.RoleId, rp.PermissionId });

            e.HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId);

            e.HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId);
        });

        // ==========================================
        // Venue
        // ==========================================
        modelBuilder.Entity<Venue>(e =>
        {
            e.HasKey(v => v.Id);
            e.Property(v => v.Status).HasDefaultValue("ACTIVE");

            e.HasOne(v => v.Owner)
                .WithMany(u => u.OwnedVenues)
                .HasForeignKey(v => v.OwnerId);
        });

        // ==========================================
        // Court
        // ==========================================
        modelBuilder.Entity<Court>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Status).HasDefaultValue("AVAILABLE");

            e.HasOne(c => c.Venue)
                .WithMany(v => v.Courts)
                .HasForeignKey(c => c.VenueId);
        });

        // ==========================================
        // PriceRule
        // ==========================================
        modelBuilder.Entity<PriceRule>(e =>
        {
            e.HasKey(pr => pr.Id);
            e.Property(pr => pr.Price).HasColumnType("decimal(18,2)");
            e.Property(pr => pr.DayOfWeek).IsRequired(false);

            e.HasOne(pr => pr.Venue)
                .WithMany(v => v.PriceRules)
                .HasForeignKey(pr => pr.VenueId);
        });

        // ==========================================
        // Booking
        // ==========================================
        modelBuilder.Entity<Booking>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.TotalPrice).HasColumnType("decimal(18,2)");

            e.HasOne(b => b.Booker)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.BookerId);

            e.HasOne(b => b.Court)
                .WithMany(c => c.Bookings)
                .HasForeignKey(b => b.CourtId);
        });

        // ==========================================
        // Match
        // ==========================================
        modelBuilder.Entity<Match>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.FeePerPlayer).HasColumnType("decimal(18,2)");
            e.Property(m => m.Status).HasDefaultValue("OPEN");

            // Booking - Match là quan hệ 1-1
            e.HasOne(m => m.Booking)
                .WithOne(b => b.Match)
                .HasForeignKey<Match>(m => m.BookingId);

            e.HasOne(m => m.Host)
                .WithMany(u => u.HostedMatches)
                .HasForeignKey(m => m.HostId);
        });

        // ==========================================
        // MatchPlayer (Many-to-Many)
        // ==========================================
        modelBuilder.Entity<MatchPlayer>(e =>
        {
            e.HasKey(mp => new { mp.MatchId, mp.UserId });
            e.Property(mp => mp.Status).HasDefaultValue("PENDING");

            e.HasOne(mp => mp.Match)
                .WithMany(m => m.MatchPlayers)
                .HasForeignKey(mp => mp.MatchId);

            e.HasOne(mp => mp.User)
                .WithMany(u => u.MatchPlayers)
                .HasForeignKey(mp => mp.UserId);
        });
    }
}