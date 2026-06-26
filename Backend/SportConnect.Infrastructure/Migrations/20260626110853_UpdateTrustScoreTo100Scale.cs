using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTrustScoreTo100Scale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "trust_score",
                table: "Users",
                type: "float",
                nullable: false,
                defaultValue: 100.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldDefaultValue: 5.0);

            migrationBuilder.Sql("UPDATE Users SET trust_score = trust_score * 20;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Users SET trust_score = trust_score / 20;");

            migrationBuilder.AlterColumn<double>(
                name: "trust_score",
                table: "Users",
                type: "float",
                nullable: false,
                defaultValue: 5.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldDefaultValue: 100.0);
        }
    }
}
