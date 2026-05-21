using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.DTOs.Owner;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class BookingService : IBookingService
{
    private readonly IUnitOfWork _unitOfWork;

    public BookingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    private decimal CalculatePriceForBlock(TimeSpan blockStart, TimeSpan blockEnd, List<PriceRule> rules, int dayOfWeek)
    {
        // Sort rules by duration so smaller ranges (specific hours) override larger ranges (all day)
        var sortedRules = rules.OrderBy(r => r.EndHour - r.StartHour).ToList();

        // 1. Find exact match for the day
        var applicableRule = sortedRules.FirstOrDefault(r => 
            r.DayOfWeek == dayOfWeek && 
            r.StartHour <= blockStart && 
            r.EndHour >= blockEnd);

        // 2. If no exact day, find "all days" rule (DayOfWeek == null)
        if (applicableRule == null)
        {
            applicableRule = sortedRules.FirstOrDefault(r => 
                r.DayOfWeek == null && 
                r.StartHour <= blockStart && 
                r.EndHour >= blockEnd);
        }

        // If no rule matches, default to 0
        if (applicableRule == null) return 0;

        // The price in PriceRule is usually Per Hour.
        // So for a 30-minute block, it is Price / 2.
        var durationHours = (decimal)(blockEnd - blockStart).TotalHours;
        return applicableRule.Price * durationHours;
    }

    public async Task<List<CourtAvailabilityDto>> GetAvailabilityAsync(Guid venueId, DateTime date)
    {
        var targetDate = date.Date; // Ensure time is 00:00:00
        int dayOfWeekIndex = (int)targetDate.DayOfWeek; // 0 = Sunday, 1 = Monday...

        var venues = await _unitOfWork.Repository<Venue>().FindAsync(v => v.Id == venueId);
        var venue = venues.FirstOrDefault();
        if (venue == null) throw new Exception("Venue not found");

        var courts = await _unitOfWork.Repository<Court>().FindAsync(c => c.VenueId == venueId && c.Status == "AVAILABLE");
        var priceRules = (await _unitOfWork.Repository<PriceRule>().FindAsync(p => p.VenueId == venueId)).ToList();
        
        // Find bookings for the date
        var bookings = await _unitOfWork.Repository<Booking>().FindAsync(b => 
            b.Court.VenueId == venueId && 
            b.Status != "CANCELLED" && 
            b.StartTime.Date == targetDate);

        var result = new List<CourtAvailabilityDto>();

        foreach (var court in courts)
        {
            var courtBookings = bookings.Where(b => b.CourtId == court.Id).ToList();
            var timeSlots = new List<TimeSlotDto>();

            var currentSlotStart = venue.OperatingStartHour;
            var endOfDay = venue.OperatingEndHour;

            while (currentSlotStart < endOfDay)
            {
                var currentSlotEnd = currentSlotStart.Add(TimeSpan.FromMinutes(30));
                
                // If the end exceeds operating hour, cap it
                if (currentSlotEnd > endOfDay)
                {
                    currentSlotEnd = endOfDay;
                }

                // Check availability
                var slotStartDateTime = targetDate.Add(currentSlotStart);
                var slotEndDateTime = targetDate.Add(currentSlotEnd);

                bool isAvailable = !courtBookings.Any(b => 
                    b.StartTime < slotEndDateTime && b.EndTime > slotStartDateTime);

                decimal slotPrice = CalculatePriceForBlock(currentSlotStart, currentSlotEnd, priceRules, dayOfWeekIndex);

                timeSlots.Add(new TimeSlotDto
                {
                    StartTime = slotStartDateTime,
                    EndTime = slotEndDateTime,
                    Price = slotPrice,
                    IsAvailable = isAvailable
                });

                currentSlotStart = currentSlotEnd;
            }

            result.Add(new CourtAvailabilityDto
            {
                CourtId = court.Id,
                CourtName = court.CourtName,
                TimeSlots = timeSlots
            });
        }

        return result;
    }

    public async Task<BookingDto> CreateBookingAsync(Guid userId, CreateBookingDto dto)
    {
        var court = await _unitOfWork.Repository<Court>().GetByIdAsync(dto.CourtId);
        if (court == null) throw new Exception("Court not found");

        // Validate time
        if (dto.EndTime <= dto.StartTime) throw new Exception("End time must be after start time");
        if (dto.StartTime < DateTime.UtcNow) throw new Exception("Cannot book in the past");

        // Validate overlap
        var existingBookings = await _unitOfWork.Repository<Booking>().FindAsync(b => 
            b.CourtId == dto.CourtId && 
            b.Status != "CANCELLED" && 
            b.StartTime < dto.EndTime && 
            b.EndTime > dto.StartTime);

        if (existingBookings.Any())
        {
            throw new Exception("The selected time slot is no longer available.");
        }

        // Calculate price
        var targetDate = dto.StartTime.Date;
        int dayOfWeekIndex = (int)targetDate.DayOfWeek;
        var priceRules = (await _unitOfWork.Repository<PriceRule>().FindAsync(p => p.VenueId == court.VenueId)).ToList();
        
        decimal totalPrice = 0;
        var currentCursor = dto.StartTime.TimeOfDay;
        var endCursor = dto.EndTime.TimeOfDay;

        // Iterate through 30-min blocks to calculate exactly
        while (currentCursor < endCursor)
        {
            var nextCursor = currentCursor.Add(TimeSpan.FromMinutes(30));
            if (nextCursor > endCursor) nextCursor = endCursor;

            totalPrice += CalculatePriceForBlock(currentCursor, nextCursor, priceRules, dayOfWeekIndex);
            
            currentCursor = nextCursor;
        }

        var booking = new Booking
        {
            BookerId = userId,
            CourtId = dto.CourtId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            TotalPrice = totalPrice,
            Status = "PENDING",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Booking>().AddAsync(booking);
        await _unitOfWork.CompleteAsync();

        // For response, we need venue info
        var venues = await _unitOfWork.Repository<Venue>().FindAsync(v => v.Id == court.VenueId);
        var venue = venues.FirstOrDefault();

        return new BookingDto
        {
            Id = booking.Id,
            VenueId = court.VenueId,
            VenueName = venue?.Name ?? "",
            CourtId = court.Id,
            CourtName = court.CourtName,
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt
        };
    }

    public async Task<IEnumerable<BookingDto>> GetMyBookingsAsync(Guid userId)
    {
        var bookings = (await _unitOfWork.Repository<Booking>().FindAsync(b => b.BookerId == userId))
            .OrderByDescending(x => x.CreatedAt).ToList();

        if (!bookings.Any()) return new List<BookingDto>();

        // Fix N+1: batch load courts and venues in 2 queries instead of 2*N
        var courtIds = bookings.Select(b => b.CourtId).ToHashSet();
        var courts = (await _unitOfWork.Repository<Court>().FindAsync(c => courtIds.Contains(c.Id)))
            .ToDictionary(c => c.Id);

        var venueIds = courts.Values.Select(c => c.VenueId).ToHashSet();
        var venues = (await _unitOfWork.Repository<Venue>().FindAsync(v => venueIds.Contains(v.Id)))
            .ToDictionary(v => v.Id);

        return bookings.Select(b =>
        {
            courts.TryGetValue(b.CourtId, out var court);
            var venue = court != null && venues.TryGetValue(court.VenueId, out var v) ? v : null;
            return new BookingDto
            {
                Id = b.Id,
                VenueId = venue?.Id ?? Guid.Empty,
                VenueName = venue?.Name ?? "N/A",
                CourtId = court?.Id ?? Guid.Empty,
                CourtName = court?.CourtName ?? "N/A",
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                TotalPrice = b.TotalPrice,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            };
        }).ToList();
    }

    public async Task<IEnumerable<BookingDto>> GetOwnerBookingsAsync(Guid ownerId)
    {
        // Get all venues owned by this owner
        var venues = (await _unitOfWork.Repository<Venue>().FindAsync(v => v.OwnerId == ownerId)).ToList();
        var venueIds = venues.Select(v => v.Id).ToHashSet();

        if (!venueIds.Any()) return new List<BookingDto>();

        var courts = (await _unitOfWork.Repository<Court>().FindAsync(c => venueIds.Contains(c.VenueId))).ToList();
        var courtIds = courts.Select(c => c.Id).ToHashSet();

        var bookings = (await _unitOfWork.Repository<Booking>().FindAsync(b => courtIds.Contains(b.CourtId)))
            .OrderByDescending(x => x.CreatedAt).ToList();

        if (!bookings.Any()) return new List<BookingDto>();

        var bookerIds = bookings.Select(b => b.BookerId).ToHashSet();
        var bookers = (await _unitOfWork.Repository<User>().FindAsync(u => bookerIds.Contains(u.Id)))
            .ToDictionary(u => u.Id);

        var courtsDict = courts.ToDictionary(c => c.Id);
        var venuesDict = venues.ToDictionary(v => v.Id);

        return bookings.Select(b =>
        {
            courtsDict.TryGetValue(b.CourtId, out var court);
            var venue = court != null && venuesDict.TryGetValue(court.VenueId, out var v) ? v : null;
            bookers.TryGetValue(b.BookerId, out var booker);
            
            return new BookingDto
            {
                Id = b.Id,
                VenueId = venue?.Id ?? Guid.Empty,
                VenueName = venue?.Name ?? "N/A",
                CourtId = court?.Id ?? Guid.Empty,
                CourtName = court?.CourtName ?? "N/A",
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                TotalPrice = b.TotalPrice,
                Status = b.Status,
                CreatedAt = b.CreatedAt,
                BookerName = booker?.FullName ?? booker?.Username ?? "Unknown",
                BookerPhone = booker?.Phone ?? ""
            };
        }).ToList();
    }

    public async Task<bool> UpdateBookingStatusAsync(Guid bookingId, Guid ownerId, string status)
    {
        var booking = await _unitOfWork.Repository<Booking>().GetByIdAsync(bookingId);
        if (booking == null) return false;

        var court = await _unitOfWork.Repository<Court>().GetByIdAsync(booking.CourtId);
        if (court == null) return false;

        var venue = await _unitOfWork.Repository<Venue>().GetByIdAsync(court.VenueId);
        if (venue == null || venue.OwnerId != ownerId) return false; // Unauthorized

        booking.Status = status;
        _unitOfWork.Repository<Booking>().Update(booking);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<OwnerDashboardStatsDto> GetOwnerDashboardStatsAsync(Guid ownerId)
    {
        var venues = (await _unitOfWork.Repository<Venue>().FindAsync(v => v.OwnerId == ownerId)).ToList();
        var venueIds = venues.Select(v => v.Id).ToHashSet();

        if (!venueIds.Any()) return new OwnerDashboardStatsDto();

        var courts = (await _unitOfWork.Repository<Court>().FindAsync(c => venueIds.Contains(c.VenueId))).ToList();
        var courtIds = courts.Select(c => c.Id).ToHashSet();

        var now = DateTime.UtcNow;
        var startOfDay = now.Date;
        var endOfDay = startOfDay.AddDays(1).AddTicks(-1);
        
        var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek + (int)DayOfWeek.Monday); // Assuming Monday is start of week
        var endOfWeek = startOfWeek.AddDays(7).AddTicks(-1);

        var allBookings = (await _unitOfWork.Repository<Booking>().FindAsync(b => courtIds.Contains(b.CourtId) && b.Status != "CANCELLED")).ToList();

        var todayBookingsCount = allBookings.Count(b => b.StartTime >= startOfDay && b.StartTime <= endOfDay);
        var weeklyRevenue = allBookings.Where(b => b.StartTime >= startOfWeek && b.StartTime <= endOfWeek && b.Status == "CONFIRMED").Sum(b => b.TotalPrice);
        
        // Mock new reviews since we don't have review entity yet
        var newReviews = 0;

        return new OwnerDashboardStatsDto
        {
            TodayBookings = todayBookingsCount,
            WeeklyRevenue = weeklyRevenue,
            NewReviews = newReviews
        };
    }
}
