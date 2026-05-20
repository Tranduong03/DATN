using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Public;

namespace SportConnect.Application.Interfaces;

public interface IPublicVenueService
{
    Task<IEnumerable<PublicVenueDto>> GetActiveVenuesAsync(string? searchTerm = null);
    Task<PublicVenueDetailDto?> GetVenueDetailAsync(Guid venueId);
}
