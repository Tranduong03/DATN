using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using SportConnect.Application.Interfaces;

namespace SportConnect.Application.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var emailSettings = _config.GetSection("EmailSettings");
        var host = emailSettings["Host"];
        var portStr = emailSettings["Port"];
        var username = emailSettings["Username"];
        var password = emailSettings["Password"];
        var fromEmail = emailSettings["FromEmail"];
        var enableSslStr = emailSettings["EnableSsl"];

        // Nếu chưa cấu hình EmailSettings, sẽ in ra console để test
        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username)) 
        {
            Console.WriteLine("--------------------------------------------------");
            Console.WriteLine($"[EMAIL MOCK] To: {toEmail}");
            Console.WriteLine($"[EMAIL MOCK] Subject: {subject}");
            Console.WriteLine($"[EMAIL MOCK] Body: {body}");
            Console.WriteLine("--------------------------------------------------");
            return;
        }

        int port = int.TryParse(portStr, out int p) ? p : 587;
        bool enableSsl = bool.TryParse(enableSslStr, out bool b) ? b : true;

        var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = enableSsl
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail ?? username, "SportConnect"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}
