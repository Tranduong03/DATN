using System.Text.Json;
using SportConnect.Core.Exceptions;

namespace SportConnect.API.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var acceptLanguage = context.Request.Headers["Accept-Language"].ToString();

        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            logger.LogWarning(ex, "App exception at {Path}: {Message}", context.Request.Path, ex.Message);
            var msg = LocalizeErrorMessage(ex.Message, acceptLanguage);
            await WriteJsonResponse(context, (int)ex.StatusCode,
                new { isSuccess = false, message = msg });
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Unauthorized access: {Path}", context.Request.Path);
            var msg = LocalizeErrorMessage("Bạn không có quyền truy cập.", acceptLanguage);
            await WriteJsonResponse(context, StatusCodes.Status401Unauthorized,
                new { isSuccess = false, message = msg });
        }
        catch (KeyNotFoundException ex)
        {
            logger.LogWarning(ex, "Resource not found: {Path}", context.Request.Path);
            var msg = LocalizeErrorMessage(ex.Message, acceptLanguage);
            await WriteJsonResponse(context, StatusCodes.Status404NotFound,
                new { isSuccess = false, message = msg });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception at {Path}: {Message}", context.Request.Path, ex.Message);
            var msg = LocalizeErrorMessage("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.", acceptLanguage);
            await WriteJsonResponse(context, StatusCodes.Status500InternalServerError,
                new { isSuccess = false, message = msg });
        }
    }

    private static string LocalizeErrorMessage(string message, string acceptLanguage)
    {
        if (string.IsNullOrEmpty(acceptLanguage) || !acceptLanguage.StartsWith("en", StringComparison.OrdinalIgnoreCase))
        {
            if (message == "Invalid username/email or password.") return "Tài khoản hoặc mật khẩu không đúng.";
            if (message == "User not found.") return "Không tìm thấy người dùng.";
            if (message == "Invalid Google token.") return "Token Google không hợp lệ.";
            if (message == "Google token did not contain an email.") return "Token Google không chứa email.";
            return message;
        }

        return message switch
        {
            "Tài khoản hoặc mật khẩu không đúng." => "Invalid username/email or password.",
            "Tài khoản không có mật khẩu hợp lệ." => "Account does not have a valid password.",
            "Bạn không có quyền truy cập trang quản trị." => "You do not have permission to access the admin panel.",
            "Vui lòng nhập Email hoặc Số điện thoại." => "Please enter Email or Phone number.",
            "Username, Email hoặc Số điện thoại đã tồn tại." => "Username, Email or Phone number already exists.",
            "Mật khẩu cũ không chính xác." => "Incorrect old password.",
            "Không tìm thấy tài khoản với email này." => "Account with this email not found.",
            "Không tìm thấy tài khoản với số điện thoại này." => "Account with this phone number not found.",
            "Vui lòng cung cấp Email hoặc Số điện thoại." => "Please provide Email or Phone number.",
            "Bạn không có quyền truy cập." => "You do not have permission to access.",
            "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau." => "A system error occurred. Please try again later.",
            _ => message
        };
    }

    private static async Task WriteJsonResponse(HttpContext context, int statusCode, object body)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";
        var json = JsonSerializer.Serialize(body, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await context.Response.WriteAsync(json);
    }
}
