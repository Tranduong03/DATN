using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamsAndUserPersonalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "fav_position",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "frequency",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "goals",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "height",
                table: "Users",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "preferred_locations",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "preferred_sports",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "special_notes",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "sports_level",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "weight",
                table: "Users",
                type: "float",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    sport_type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    avatar_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    creator_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    skill_level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "ACTIVE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.id);
                    table.ForeignKey(
                        name: "FK_Teams_Users_creator_id",
                        column: x => x.creator_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeamMembers",
                columns: table => new
                {
                    team_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    user_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "MEMBER"),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "PENDING"),
                    joined_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamMembers", x => new { x.team_id, x.user_id });
                    table.ForeignKey(
                        name: "FK_TeamMembers_Teams_team_id",
                        column: x => x.team_id,
                        principalTable: "Teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamMembers_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_user_id",
                table: "TeamMembers",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_creator_id",
                table: "Teams",
                column: "creator_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeamMembers");

            migrationBuilder.DropTable(
                name: "Teams");

            migrationBuilder.DropColumn(
                name: "fav_position",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "frequency",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "goals",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "height",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "preferred_locations",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "preferred_sports",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "special_notes",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "sports_level",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "weight",
                table: "Users");
        }
    }
}
