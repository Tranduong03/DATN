using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeBookingIdNullableInMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Matches_booking_id",
                table: "Matches");

            migrationBuilder.AlterColumn<Guid>(
                name: "booking_id",
                table: "Matches",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<string>(
                name: "CustomCourtName",
                table: "Matches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CustomEndTime",
                table: "Matches",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CustomStartTime",
                table: "Matches",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomVenueName",
                table: "Matches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SportType",
                table: "Matches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Matches_booking_id",
                table: "Matches",
                column: "booking_id",
                unique: true,
                filter: "[booking_id] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Matches_booking_id",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "CustomCourtName",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "CustomEndTime",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "CustomStartTime",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "CustomVenueName",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "SportType",
                table: "Matches");

            migrationBuilder.AlterColumn<Guid>(
                name: "booking_id",
                table: "Matches",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Matches_booking_id",
                table: "Matches",
                column: "booking_id",
                unique: true);
        }
    }
}
