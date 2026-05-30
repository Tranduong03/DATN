using System.Net;

namespace SportConnect.Core.Exceptions;

public class BadRequestException : AppException
{
    public BadRequestException(string message) 
        : base(message, HttpStatusCode.BadRequest)
    {
    }
}
