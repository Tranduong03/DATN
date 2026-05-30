using Microsoft.Extensions.Configuration;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;
using System;
using System.Collections.Generic;

namespace SportConnect.Infrastructure.Services;

public class VnPayService : IVnPayService
{
    private readonly IConfiguration _config;

    public VnPayService(IConfiguration config)
    {
        _config = config;
    }

    public string CreatePaymentUrl(Booking booking, string ipAddress)
    {
        var tmnCode = _config["VnPaySettings:TmnCode"] ?? "2QXUI4J4";
        var hashSecret = _config["VnPaySettings:HashSecret"] ?? "GETSECRETKEYHERE";
        var baseUrl = _config["VnPaySettings:BaseUrl"] ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        var returnUrl = _config["VnPaySettings:ReturnUrl"] ?? "http://localhost:5173/payment-result";

        var vnpay = new VnPayLibrary();

        // Tính tiền theo VND (VNPay yêu cầu nhân 100)
        var amount = (long)(booking.TotalPrice * 100);

        vnpay.AddRequestData("vnp_Version", "2.1.0");
        vnpay.AddRequestData("vnp_Command", "pay");
        vnpay.AddRequestData("vnp_TmnCode", tmnCode);
        vnpay.AddRequestData("vnp_Amount", amount.ToString());
        vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
        vnpay.AddRequestData("vnp_CurrCode", "VND");
        vnpay.AddRequestData("vnp_IpAddr", ipAddress);
        vnpay.AddRequestData("vnp_Locale", "vn");
        vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan dat san SportConnect booking: {booking.Id}");
        vnpay.AddRequestData("vnp_OrderType", "other");
        vnpay.AddRequestData("vnp_ReturnUrl", returnUrl);
        vnpay.AddRequestData("vnp_TxnRef", booking.Id.ToString());

        var paymentUrl = vnpay.CreateRequestUrl(baseUrl, hashSecret);
        return paymentUrl;
    }

    public VnPayPaymentResponse ExecutePayment(Dictionary<string, string> queryParameters)
    {
        var hashSecret = _config["VnPaySettings:HashSecret"] ?? "GETSECRETKEYHERE";
        var vnpay = new VnPayLibrary();

        foreach (var (key, value) in queryParameters)
        {
            if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
            {
                vnpay.AddResponseData(key, value);
            }
        }

        vnpay.GetResponseData("vnp_SecureHash");
        var vnp_SecureHash = queryParameters.GetValueOrDefault("vnp_SecureHash") ?? string.Empty;
        var vnp_ResponseCode = queryParameters.GetValueOrDefault("vnp_ResponseCode") ?? string.Empty;
        var vnp_TxnRef = queryParameters.GetValueOrDefault("vnp_TxnRef") ?? string.Empty;
        var vnp_TransactionNo = queryParameters.GetValueOrDefault("vnp_TransactionNo") ?? string.Empty;
        var vnp_OrderInfo = queryParameters.GetValueOrDefault("vnp_OrderInfo") ?? string.Empty;

        var checkSignature = vnpay.ValidateSignature(vnp_SecureHash, hashSecret);

        if (!checkSignature)
        {
            return new VnPayPaymentResponse
            {
                Success = false
            };
        }

        return new VnPayPaymentResponse
        {
            Success = vnp_ResponseCode == "00",
            OrderId = vnp_TxnRef,
            TransactionId = vnp_TransactionNo,
            OrderDescription = vnp_OrderInfo,
            VnPayResponseCode = vnp_ResponseCode
        };
    }
}
