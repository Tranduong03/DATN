using System;
using System.Data.SqlClient;

var hash = BCrypt.Net.BCrypt.HashPassword("Admin@12345");
Console.WriteLine("Hash: " + hash);

// Update directly via SQL
var connStr = "Server=localhost;Database=Sport_Connect_DB;Integrated Security=True;";
using var conn = new SqlConnection(connStr);
conn.Open();
var cmd = conn.CreateCommand();
cmd.CommandText = "UPDATE Users SET password_hash = @hash WHERE email = 'phiduong.it.hcm@gmail.com'";
cmd.Parameters.AddWithValue("@hash", hash);
var rows = cmd.ExecuteNonQuery();
Console.WriteLine($"Updated {rows} row(s)");

// Verify
cmd.CommandText = "SELECT username, email, SUBSTRING(password_hash,1,20) as pw_preview FROM Users WHERE email = 'phiduong.it.hcm@gmail.com'";
cmd.Parameters.Clear();
using var reader = cmd.ExecuteReader();
while (reader.Read()) {
    Console.WriteLine($"username={reader["username"]} email={reader["email"]} pw_starts={reader["pw_preview"]}");
}
