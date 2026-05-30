using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace SportConnect.Infrastructure.Services;

public class VnPayLibrary
{
    private readonly SortedList<string, string> _requestData = new SortedList<string, string>(new VnPayCompare());
    private readonly SortedList<string, string> _responseData = new SortedList<string, string>(new VnPayCompare());

    public void AddRequestData(string key, string value)
    {
        if (!string.IsNullOrEmpty(value))
        {
            _requestData.Add(key, value);
        }
    }

    public void AddResponseData(string key, string value)
    {
        if (!string.IsNullOrEmpty(value))
        {
            _responseData.Add(key, value);
        }
    }

    public string GetResponseData(string key)
    {
        return _responseData.TryGetValue(key, out var val) ? val : string.Empty;
    }

    public string CreateRequestUrl(string baseUrl, string vnpHashSecret)
    {
        var queryString = new StringBuilder();
        foreach (var kv in _requestData)
        {
            if (queryString.Length > 0)
            {
                queryString.Append("&");
            }
            queryString.Append(Uri.EscapeDataString(kv.Key) + "=" + Uri.EscapeDataString(kv.Value));
        }

        var rawData = string.Join("&", _requestData.Select(kv => kv.Key + "=" + kv.Value));
        var secureHash = HmacSha512(vnpHashSecret, rawData);
        var paymentUrl = baseUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
        return paymentUrl;
    }

    public bool ValidateSignature(string inputHash, string secretKey)
    {
        var rawData = string.Join("&", _responseData
            .Where(kv => !kv.Key.StartsWith("vnp_SecureHash"))
            .Select(kv => kv.Key + "=" + kv.Value));
        var checkHash = HmacSha512(secretKey, rawData);
        return checkHash.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
    }

    private static string HmacSha512(string key, string inputData)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);
        using var hmac = new HMACSHA512(keyBytes);
        var hashValue = hmac.ComputeHash(inputBytes);
        return string.Concat(hashValue.Select(b => b.ToString("x2")));
    }
}

public class VnPayCompare : IComparer<string>
{
    public int Compare(string? x, string? y)
    {
        if (x == y) return 0;
        if (x == null) return -1;
        if (y == null) return 1;
        var vnpCompare = CompareInfo.GetCompareInfo("en-US");
        return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
    }
}
