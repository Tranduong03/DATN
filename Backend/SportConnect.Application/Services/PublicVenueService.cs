using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class PublicVenueService : IPublicVenueService
{
    private readonly IUnitOfWork _unitOfWork;

    public PublicVenueService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PublicVenueDto>> GetActiveVenuesAsync(string? searchTerm = null)
    {
        var allVenues = (await _unitOfWork.Repository<Venue>().FindAsync(v => v.Status == "ACTIVE")).ToList();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerSearch = searchTerm.ToLower();
            allVenues = allVenues.Where(v =>
                v.Name.ToLower().Contains(lowerSearch) ||
                v.Address.ToLower().Contains(lowerSearch)).ToList();
        }

        if (!allVenues.Any()) return new List<PublicVenueDto>();

        // Fix N+1: load ALL price rules for all venues in ONE query
        var venueIds = allVenues.Select(v => v.Id).ToHashSet();
        var allPriceRules = await _unitOfWork.Repository<PriceRule>().FindAsync(p => venueIds.Contains(p.VenueId));
        var priceRulesByVenue = allPriceRules.GroupBy(p => p.VenueId).ToDictionary(g => g.Key, g => g.ToList());

        return allVenues.Select(venue =>
        {
            var rules = priceRulesByVenue.GetValueOrDefault(venue.Id, new List<PriceRule>());
            decimal minPrice = rules.Any() ? rules.Min(p => p.Price) : 0;
            return new PublicVenueDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Address = venue.Address,
                Description = venue.Description,
                OperatingStartHour = venue.OperatingStartHour.ToString(@"hh\:mm"),
                OperatingEndHour = venue.OperatingEndHour.ToString(@"hh\:mm"),
                VenueScale = venue.VenueScale,
                MinPrice = minPrice,
                Rating = 5.0,
                Distance = "5km"
            };
        }).ToList();
    }

    public async Task<PublicVenueDetailDto?> GetVenueDetailAsync(Guid venueId)
    {
        var venues = await _unitOfWork.Repository<Venue>().FindAsync(v => v.Id == venueId && v.Status == "ACTIVE");
        var venue = venues.FirstOrDefault();
        
        if (venue == null) return null;

        var courts = await _unitOfWork.Repository<Court>().FindAsync(c => c.VenueId == venueId && c.Status == "AVAILABLE");
        var priceRules = await _unitOfWork.Repository<PriceRule>().FindAsync(p => p.VenueId == venueId);

        decimal minPrice = priceRules.Any() ? priceRules.Min(p => p.Price) : 0;

        return new PublicVenueDetailDto
        {
            Id = venue.Id,
            Name = venue.Name,
            Address = venue.Address,
            Description = venue.Description,
            OperatingStartHour = venue.OperatingStartHour.ToString(@"hh\:mm"),
            OperatingEndHour = venue.OperatingEndHour.ToString(@"hh\:mm"),
            VenueScale = venue.VenueScale,
            MinPrice = minPrice,
            Rating = 5.0,
            Distance = "5km",
            Courts = courts.Select(c => new PublicCourtDto
            {
                Id = c.Id,
                CourtName = c.CourtName,
                Status = c.Status
            }).ToList(),
            PriceRules = priceRules.Select(p => new PublicPriceRuleDto
            {
                DayOfWeek = p.DayOfWeek,
                StartHour = p.StartHour.ToString(@"hh\:mm"),
                EndHour = p.EndHour.ToString(@"hh\:mm"),
                Price = p.Price
            }).ToList()
        };
    }
}
