using System.Text.Json;
using SportConnect.Core.Exceptions;

namespace SportConnect.API.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            logger.LogWarning(ex, "App exception at {Path}: {Message}", context.Request.Path, ex.Message);
            await WriteJsonResponse(context, (int)ex.StatusCode,
                new { isSuccess = false, message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Unauthorized access: {Path}", context.Request.Path);
            await WriteJsonResponse(context, StatusCodes.Status401Unauthorized,
                new { isSuccess = false, message = "Bạn không có quyền truy cập." });
        }
        catch (KeyNotFoundException ex)
        {
            logger.LogWarning(ex, "Resource not found: {Path}", context.Request.Path);
            await WriteJsonResponse(context, StatusCodes.Status404NotFound,
                new { isSuccess = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception at {Path}: {Message}", context.Request.Path, ex.Message);
            await WriteJsonResponse(context, StatusCodes.Status500InternalServerError,
                new { isSuccess = false, message = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau." });
        }
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
