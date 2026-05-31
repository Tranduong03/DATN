using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Owner;

namespace SportConnect.Application.Interfaces;

public interface IOwnerVenueService
{
    Task<IEnumerable<VenueDto>> GetMyVenuesAsync(Guid ownerId);
    Task<VenueDto?> GetVenueDetailAsync(Guid venueId, Guid ownerId);
    Task<VenueDto?> UpdateVenueAsync(Guid venueId, Guid ownerId, UpdateVenueDto dto);
    
    // Images
    Task<VenueImageDto> AddVenueImageAsync(Guid venueId, Guid ownerId, AddVenueImageDto dto);
    Task<bool> DeleteVenueImageAsync(Guid venueId, Guid ownerId, Guid imageId);
    
    // Courts
    Task<IEnumerable<CourtDto>> GetCourtsAsync(Guid venueId, Guid ownerId);
    Task<CourtDto> AddCourtAsync(Guid venueId, Guid ownerId, CreateCourtDto dto);
    Task<CourtDto> UpdateCourtAsync(Guid venueId, Guid courtId, Guid ownerId, UpdateCourtDto dto);
    
    // Pricing
    Task<IEnumerable<PriceRuleDto>> GetPriceRulesAsync(Guid venueId, Guid ownerId);
    Task<bool> UpsertPriceRulesAsync(Guid venueId, Guid ownerId, List<UpsertPriceRuleDto> dtos);
}
