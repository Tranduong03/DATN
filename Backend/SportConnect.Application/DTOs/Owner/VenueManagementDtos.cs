using System;
using System.Collections.Generic;

namespace SportConnect.Application.DTOs.Owner;

public class VenueDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? OperatingStartHour { get; set; } // Send as string HH:mm
    public string? OperatingEndHour { get; set; }
    public string Status { get; set; } = string.Empty;
    public int VenueScale { get; set; }
}

public class CourtDto
{
    public Guid Id { get; set; }
    public Guid VenueId { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class CreateCourtDto
{
    public string CourtName { get; set; } = string.Empty;
    public string Status { get; set; } = "AVAILABLE";
}

public class UpdateCourtDto
{
    public string CourtName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class PriceRuleDto
{
    public Guid Id { get; set; }
    public int? DayOfWeek { get; set; }
    public string StartHour { get; set; } = string.Empty; // Format: "HH:mm"
    public string EndHour { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
}

public class UpsertPriceRuleDto
{
    public Guid? Id { get; set; }
    public int? DayOfWeek { get; set; }
    public string StartHour { get; set; } = string.Empty;
    public string EndHour { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
}
