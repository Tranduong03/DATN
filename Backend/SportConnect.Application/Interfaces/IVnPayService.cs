using System.Collections.Generic;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Interfaces;

public interface IVnPayService
{
    string CreatePaymentUrl(Booking booking, string ipAddress);
    VnPayPaymentResponse ExecutePayment(Dictionary<string, string> queryParameters);
}

public class VnPayPaymentResponse
{
    public bool Success { get; set; }
    public string PaymentMethod { get; set; } = "VNPay";
    public string OrderDescription { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string VnPayResponseCode { get; set; } = string.Empty;
}
