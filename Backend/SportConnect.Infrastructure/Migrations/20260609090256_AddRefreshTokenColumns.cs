using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokenColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "refresh_token",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "refresh_token_expiry",
                table: "Users",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "refresh_token",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "refresh_token_expiry",
                table: "Users");
        }
    }
}
