using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    role_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    username = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    full_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    avatar_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    trust_score = table.Column<double>(type: "float", nullable: false, defaultValue: 5.0),
                    no_show_count = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    status = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ActivityLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorRole = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityLogs_Users_ActorId",
                        column: x => x.ActorId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "User_Role",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    role_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User_Role", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "FK_User_Role_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_User_Role_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Venues",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    owner_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    bank_qr_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "ACTIVE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Venues", x => x.id);
                    table.ForeignKey(
                        name: "FK_Venues_Users_owner_id",
                        column: x => x.owner_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Courts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    venue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    court_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "AVAILABLE"),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courts", x => x.id);
                    table.ForeignKey(
                        name: "FK_Courts_Venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "Venues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PriceRules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    venue_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    day_of_week = table.Column<int>(type: "int", nullable: true),
                    start_hour = table.Column<TimeSpan>(type: "time", nullable: false),
                    end_hour = table.Column<TimeSpan>(type: "time", nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceRules", x => x.id);
                    table.ForeignKey(
                        name: "FK_PriceRules_Venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "Venues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StaffVenuePermissions",
                columns: table => new
                {
                    StaffUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VenueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Permission = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    GrantedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffVenuePermissions", x => new { x.StaffUserId, x.VenueId, x.Permission });
                    table.ForeignKey(
                        name: "FK_StaffVenuePermissions_Users_GrantedBy",
                        column: x => x.GrantedBy,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StaffVenuePermissions_Users_StaffUserId",
                        column: x => x.StaffUserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StaffVenuePermissions_Venues_VenueId",
                        column: x => x.VenueId,
                        principalTable: "Venues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    booker_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    court_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    start_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    total_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReceiptUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.id);
                    table.ForeignKey(
                        name: "FK_Bookings_Courts_court_id",
                        column: x => x.court_id,
                        principalTable: "Courts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_Users_booker_id",
                        column: x => x.booker_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    booking_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    host_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    skill_level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    max_players = table.Column<int>(type: "int", nullable: false),
                    fee_per_player = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "OPEN"),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.id);
                    table.ForeignKey(
                        name: "FK_Matches_Bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "Bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matches_Users_host_id",
                        column: x => x.host_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Match_Players",
                columns: table => new
                {
                    match_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    user_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    joined_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "PENDING")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Match_Players", x => new { x.match_id, x.user_id });
                    table.ForeignKey(
                        name: "FK_Match_Players_Matches_match_id",
                        column: x => x.match_id,
                        principalTable: "Matches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Match_Players_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_ActorId",
                table: "ActivityLogs",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_booker_id",
                table: "Bookings",
                column: "booker_id");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_court_id",
                table: "Bookings",
                column: "court_id");

            migrationBuilder.CreateIndex(
                name: "IX_Courts_venue_id",
                table: "Courts",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_Match_Players_user_id",
                table: "Match_Players",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_booking_id",
                table: "Matches",
                column: "booking_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Matches_host_id",
                table: "Matches",
                column: "host_id");

            migrationBuilder.CreateIndex(
                name: "IX_PriceRules_venue_id",
                table: "PriceRules",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_role_name",
                table: "Roles",
                column: "role_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StaffVenuePermissions_GrantedBy",
                table: "StaffVenuePermissions",
                column: "GrantedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StaffVenuePermissions_VenueId",
                table: "StaffVenuePermissions",
                column: "VenueId");

            migrationBuilder.CreateIndex(
                name: "IX_User_Role_role_id",
                table: "User_Role",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_email",
                table: "Users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_username",
                table: "Users",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Venues_owner_id",
                table: "Venues",
                column: "owner_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityLogs");

            migrationBuilder.DropTable(
                name: "Match_Players");

            migrationBuilder.DropTable(
                name: "PriceRules");

            migrationBuilder.DropTable(
                name: "StaffVenuePermissions");

            migrationBuilder.DropTable(
                name: "User_Role");

            migrationBuilder.DropTable(
                name: "Matches");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Courts");

            migrationBuilder.DropTable(
                name: "Venues");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
