using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Public;

namespace SportConnect.Application.Interfaces;

public interface IBookingService
{
    Task<List<CourtAvailabilityDto>> GetAvailabilityAsync(Guid venueId, DateTime date);
    Task<BookingDto> CreateBookingAsync(Guid userId, CreateBookingDto dto);
    Task<IEnumerable<BookingDto>> GetMyBookingsAsync(Guid userId);
}
