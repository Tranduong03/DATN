using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SportConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedSportCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "SportCategories",
                columns: new[] { "id", "color", "icon", "name", "status" },
                values: new object[,]
                {
                    { 1, "#50E3C2", "🏸", "Cầu lông", true },
                    { 2, "#4A90E2", "🎾", "Pickleball", true },
                    { 3, "#7ED321", "⚽", "Bóng đá", true },
                    { 4, "#F5A623", "🥎", "Quần vợt", true },
                    { 5, "#417505", "⛳", "Golf", true },
                    { 6, "#F8E71C", "🏐", "Bóng chuyền", true },
                    { 7, "#FF9500", "🏀", "Bóng rổ", true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "SportCategories",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "SportCategories",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "SportCategories",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "SportCategories",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "SportCategories",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "SportCategories",
                keyColumn: "id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "SportCategories",
                keyColumn: "id",
                keyValue: 7);
        }
    }
}
