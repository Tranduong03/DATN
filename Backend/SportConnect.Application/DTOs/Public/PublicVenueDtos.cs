using System;
using System.Collections.Generic;

namespace SportConnect.Application.DTOs.Public;

public class PublicVenueDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string OperatingStartHour { get; set; } = string.Empty;
    public string OperatingEndHour { get; set; } = string.Empty;
    public int VenueScale { get; set; }
    public string? Distance { get; set; } // For future geolocation
    public decimal MinPrice { get; set; } // Tự động tính giá min để show ra
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CoverUrl { get; set; }
    public List<string> SportTypes { get; set; } = new();
}

public class PublicVenueDetailDto : PublicVenueDto
{
    public string? BankQrUrl { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactPhone2 { get; set; }
    public List<string> GalleryImages { get; set; } = new();
    public List<PublicCourtDto> Courts { get; set; } = new();
    public List<PublicPriceRuleDto> PriceRules { get; set; } = new();
}

public class PublicCourtDto
{
    public Guid Id { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class PublicPriceRuleDto
{
    public int? DayOfWeek { get; set; }
    public string StartHour { get; set; } = string.Empty;
    public string EndHour { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
}

public class TimeSlotDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
}

public class CourtAvailabilityDto
{
    public Guid CourtId { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public List<TimeSlotDto> TimeSlots { get; set; } = new();
}

public class CreateBookingDto
{
    public Guid CourtId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

public class BookingDto
{
    public Guid Id { get; set; }
    public Guid VenueId { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public Guid CourtId { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // For Owner view
    public string BookerName { get; set; } = string.Empty;
    public string BookerPhone { get; set; } = string.Empty;
}
