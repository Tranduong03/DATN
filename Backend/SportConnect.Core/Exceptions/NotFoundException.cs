using System.Net;

namespace SportConnect.Core.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string message) 
        : base(message, HttpStatusCode.NotFound)
    {
    }
}
