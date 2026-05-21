using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.DTOs.Owner;

namespace SportConnect.Application.Interfaces;

public interface IBookingService
{
    Task<List<CourtAvailabilityDto>> GetAvailabilityAsync(Guid venueId, DateTime date);
    Task<BookingDto> CreateBookingAsync(Guid userId, CreateBookingDto dto);
    Task<IEnumerable<BookingDto>> GetMyBookingsAsync(Guid userId);

    // Owner methods
    Task<IEnumerable<BookingDto>> GetOwnerBookingsAsync(Guid ownerId);
    Task<bool> UpdateBookingStatusAsync(Guid bookingId, Guid ownerId, string status);
    Task<OwnerDashboardStatsDto> GetOwnerDashboardStatsAsync(Guid ownerId);
}
