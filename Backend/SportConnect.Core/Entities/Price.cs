namespace SportConnect.Core.Entities;

public class PriceRule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VenueId { get; set; }

    /// <summary>
    /// 0: Chủ nhật, 1-6: Thứ 2 - Thứ 7, null: Áp dụng tất cả các ngày
    /// </summary>
    public int? DayOfWeek { get; set; }

    public TimeSpan StartHour { get; set; } // Ví dụ: 05:00:00
    public TimeSpan EndHour { get; set; }   // Ví dụ: 16:00:00
    public decimal Price { get; set; }
    public string? Description { get; set; }

    // Navigation properties
    public Venue Venue { get; set; } = null!;
}