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
        var allVenues = await _unitOfWork.Repository<Venue>().FindAsync(v => v.Status == "ACTIVE");

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerSearch = searchTerm.ToLower();
            allVenues = allVenues.Where(v => v.Name.ToLower().Contains(lowerSearch) || v.Address.ToLower().Contains(lowerSearch));
        }

        var result = new List<PublicVenueDto>();

        foreach (var venue in allVenues)
        {
            var priceRules = await _unitOfWork.Repository<PriceRule>().FindAsync(p => p.VenueId == venue.Id);
            decimal minPrice = priceRules.Any() ? priceRules.Min(p => p.Price) : 0;

            result.Add(new PublicVenueDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Address = venue.Address,
                Description = venue.Description,
                OperatingStartHour = venue.OperatingStartHour.ToString(@"hh\:mm"),
                OperatingEndHour = venue.OperatingEndHour.ToString(@"hh\:mm"),
                VenueScale = venue.VenueScale,
                MinPrice = minPrice,
                Rating = 5.0, // Mock for now
                Distance = "5km" // Mock for now
            });
        }

        return result;
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
