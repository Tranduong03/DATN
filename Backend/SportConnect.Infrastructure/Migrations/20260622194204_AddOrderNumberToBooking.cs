using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderNumberToBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "order_number",
                table: "Bookings",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "order_number",
                table: "Bookings");
        }
    }
}
