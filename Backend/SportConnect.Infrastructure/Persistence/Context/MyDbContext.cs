using Microsoft.EntityFrameworkCore;
using SportConnect.Core.Entities;

namespace SportConnect.Infrastructure.Persistence.Context;

public class MyDbContext(DbContextOptions<MyDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<PriceRule> PriceRules => Set<PriceRule>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchPlayer> MatchPlayers => Set<MatchPlayer>();
    public DbSet<StaffVenuePermission> StaffVenuePermissions => Set<StaffVenuePermission>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<VenueImage> VenueImages => Set<VenueImage>();
    public DbSet<OwnerProfile> OwnerProfiles => Set<OwnerProfile>();
    public DbSet<SportCategory> SportCategories => Set<SportCategory>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<FavoriteVenue> FavoriteVenues => Set<FavoriteVenue>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();

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
                .IsRequired(false);

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

            entity.Property(e => e.RefreshToken)
                .HasColumnName("refresh_token")
                .HasMaxLength(500)
                .IsRequired(false);

            entity.Property(e => e.RefreshTokenExpiry)
                .HasColumnName("refresh_token_expiry")
                .IsRequired(false);

            entity.Property(e => e.Height)
                .HasColumnName("height")
                .IsRequired(false);

            entity.Property(e => e.Weight)
                .HasColumnName("weight")
                .IsRequired(false);

            entity.Property(e => e.SpecialNotes)
                .HasColumnName("special_notes")
                .HasColumnType("nvarchar(max)")
                .IsRequired(false);

            entity.Property(e => e.FavPosition)
                .HasColumnName("fav_position")
                .HasMaxLength(255)
                .IsRequired(false);

            entity.Property(e => e.SportsLevel)
                .HasColumnName("sports_level")
                .HasMaxLength(500)
                .IsRequired(false);

            entity.Property(e => e.Goals)
                .HasColumnName("goals")
                .HasMaxLength(500)
                .IsRequired(false);

            entity.Property(e => e.Frequency)
                .HasColumnName("frequency")
                .HasMaxLength(255)
                .IsRequired(false);

            entity.Property(e => e.PreferredSports)
                .HasColumnName("preferred_sports")
                .HasColumnType("nvarchar(max)")
                .IsRequired(false);

            entity.Property(e => e.PreferredLocations)
                .HasColumnName("preferred_locations")
                .HasColumnType("nvarchar(max)")
                .IsRequired(false);
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

        // ==========================================
        // 1.5. CẤU HÌNH BẢNG OWNER PROFILE
        // ==========================================
        modelBuilder.Entity<OwnerProfile>(entity =>
        {
            entity.ToTable("OwnerProfiles");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(e => e.OnboardingStatus)
                .HasColumnName("onboarding_status")
                .HasMaxLength(50)
                .HasDefaultValue("NotStarted");

            entity.Property(e => e.VerificationStatus)
                .HasColumnName("verification_status")
                .HasMaxLength(50)
                .HasDefaultValue("None");

            entity.Property(e => e.CurrentStep)
                .HasColumnName("current_step")
                .HasDefaultValue(1);

            entity.Property(e => e.DraftData)
                .HasColumnName("draft_data")
                .HasColumnType("nvarchar(max)");

            entity.Property(e => e.RejectReason)
                .HasColumnName("reject_reason")
                .HasColumnType("nvarchar(max)");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
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

            entity.Property(e => e.ContactPhone)
                .HasColumnName("contact_phone")
                .HasMaxLength(50);

            entity.Property(e => e.ContactPhone2)
                .HasColumnName("contact_phone2")
                .HasMaxLength(50);

            entity.Property(e => e.Description)
                .HasColumnName("description")
                .HasColumnType("nvarchar(max)");

            entity.Property(e => e.OperatingStartHour)
                .HasColumnName("operating_start_hour");

            entity.Property(e => e.OperatingEndHour)
                .HasColumnName("operating_end_hour");

            var sportTypesComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.SequenceEqual(c2)),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList()
            );

            entity.Property(e => e.SportTypes)
                .HasColumnName("sport_types")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                )
                .Metadata.SetValueComparer(sportTypesComparer);


            entity.Property(e => e.VenueScale)
                .HasColumnName("venue_scale")
                .HasDefaultValue(0);

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

        modelBuilder.Entity<VenueImage>(entity =>
        {
            entity.ToTable("VenueImages");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.VenueId)
                .HasColumnName("venue_id")
                .IsRequired();

            entity.Property(e => e.ImageUrl)
                .HasColumnName("image_url")
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(e => e.ImageType)
                .HasColumnName("image_type")
                .HasMaxLength(50)
                .HasDefaultValue("Gallery");

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.Images)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);
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

        // ==========================================
        // 4. CẤU HÌNH BẢNG QUẢN LÝ QUYỀN NHÂN VIÊN VÀ LOG
        // ==========================================
        modelBuilder.Entity<StaffVenuePermission>(entity =>
        {
            entity.ToTable("StaffVenuePermissions");

            entity.HasKey(e => new { e.StaffUserId, e.VenueId, e.Permission });

            entity.HasOne(e => e.Staff)
                .WithMany()
                .HasForeignKey(e => e.StaffUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Venue)
                .WithMany()
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Granter)
                .WithMany()
                .HasForeignKey(e => e.GrantedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.ToTable("ActivityLogs");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Actor)
                .WithMany()
                .HasForeignKey(e => e.ActorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ==========================================
        // 5. CẤU HÌNH BẢNG SPORT CATEGORY
        // ==========================================
        modelBuilder.Entity<SportCategory>(entity =>
        {
            entity.ToTable("SportCategories");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Color)
                .HasColumnName("color")
                .HasMaxLength(50);

            entity.Property(e => e.Icon)
                .HasColumnName("icon")
                .HasMaxLength(50);

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasDefaultValue(true);

            entity.HasData(
                new SportCategory { Id = 1, Name = "Cầu lông", Color = "#50E3C2", Icon = "🏸", Status = true },
                new SportCategory { Id = 2, Name = "Pickleball", Color = "#4A90E2", Icon = "🎾", Status = true },
                new SportCategory { Id = 3, Name = "Bóng đá", Color = "#7ED321", Icon = "⚽", Status = true },
                new SportCategory { Id = 4, Name = "Quần vợt", Color = "#F5A623", Icon = "🥎", Status = true },
                new SportCategory { Id = 5, Name = "Golf", Color = "#417505", Icon = "⛳", Status = true },
                new SportCategory { Id = 6, Name = "Bóng chuyền", Color = "#F8E71C", Icon = "🏐", Status = true },
                new SportCategory { Id = 7, Name = "Bóng rổ", Color = "#FF9500", Icon = "🏀", Status = true }
            );
        });

        // ==========================================
        // 6. CẤU HÌNH BẢNG NOTIFICATION & FAVORITE
        // ==========================================
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Message)
                .HasColumnType("nvarchar(max)")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FavoriteVenue>(entity =>
        {
            entity.ToTable("FavoriteVenues");

            entity.HasKey(e => new { e.UserId, e.VenueId });

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany(u => u.FavoriteVenues)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.FavoritedByUsers)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==========================================
        // 7. CẤU HÌNH BẢNG REVIEW ĐÁNH GIÁ
        // ==========================================
        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("Reviews");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Rating)
                .IsRequired();

            entity.Property(e => e.Comment)
                .HasColumnType("nvarchar(max)");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.Reviews)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Booking)
                .WithOne(b => b.Review)
                .HasForeignKey<Review>(e => e.BookingId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ==========================================
        // 8. CẤU HÌNH BẢNG ĐỘI/NHÓM (TEAMS & TEAM MEMBERS)
        // ==========================================
        modelBuilder.Entity<Team>(entity =>
        {
            entity.ToTable("Teams");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id");

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasColumnName("description")
                .HasColumnType("nvarchar(max)");

            entity.Property(e => e.SportType)
                .HasColumnName("sport_type")
                .HasMaxLength(100);

            entity.Property(e => e.AvatarUrl)
                .HasColumnName("avatar_url")
                .HasMaxLength(500);

            entity.Property(e => e.CreatorId)
                .HasColumnName("creator_id");

            entity.Property(e => e.SkillLevel)
                .HasColumnName("skill_level")
                .HasMaxLength(50);

            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(255);

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .HasDefaultValue("ACTIVE");

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETDATE()");

            // Relationship with Creator (User)
            entity.HasOne(e => e.Creator)
                .WithMany(u => u.CreatedTeams)
                .HasForeignKey(e => e.CreatorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.ToTable("TeamMembers");

            entity.HasKey(e => new { e.TeamId, e.UserId });

            entity.Property(e => e.TeamId)
                .HasColumnName("team_id");

            entity.Property(e => e.UserId)
                .HasColumnName("user_id");

            entity.Property(e => e.Role)
                .HasColumnName("role")
                .HasMaxLength(50)
                .HasDefaultValue("MEMBER");

            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .HasDefaultValue("PENDING");

            entity.Property(e => e.JoinedAt)
                .HasColumnName("joined_at")
                .HasDefaultValueSql("GETDATE()");

            // Relationships
            entity.HasOne(e => e.Team)
                .WithMany(t => t.TeamMembers)
                .HasForeignKey(e => e.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.TeamMemberships)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}