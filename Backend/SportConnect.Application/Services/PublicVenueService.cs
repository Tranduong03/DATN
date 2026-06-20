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

        var allAvatars = await _unitOfWork.Repository<VenueImage>().FindAsync(vi => venueIds.Contains(vi.VenueId) && vi.ImageType == "Avatar");
        var avatarsByVenue = allAvatars.GroupBy(vi => vi.VenueId).ToDictionary(g => g.Key, g => g.First().ImageUrl);

        var allCovers = await _unitOfWork.Repository<VenueImage>().FindAsync(vi => venueIds.Contains(vi.VenueId) && (vi.ImageType == "Cover" || vi.ImageType == "Gallery"));
        var coversByVenue = allCovers.GroupBy(vi => vi.VenueId).ToDictionary(
            g => g.Key, 
            g => g.FirstOrDefault(img => img.ImageType == "Cover")?.ImageUrl ?? g.First().ImageUrl
        );

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
                Rating = venue.AverageRating,
                ReviewCount = venue.ReviewCount,
                Distance = "5km",
                AvatarUrl = avatarsByVenue.GetValueOrDefault(venue.Id),
                CoverUrl = coversByVenue.GetValueOrDefault(venue.Id),
                SportTypes = venue.SportTypes
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
        var images = await _unitOfWork.Repository<VenueImage>().FindAsync(vi => vi.VenueId == venueId);

        decimal minPrice = priceRules.Any() ? priceRules.Min(p => p.Price) : 0;
        var avatar = images.FirstOrDefault(vi => vi.ImageType == "Avatar")?.ImageUrl;
        var gallery = images.Where(vi => vi.ImageType == "Gallery" || vi.ImageType == "Cover").Select(vi => vi.ImageUrl).ToList();

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
            Rating = venue.AverageRating,
            ReviewCount = venue.ReviewCount,
            Distance = "5km",
            AvatarUrl = avatar,
            CoverUrl = images.FirstOrDefault(vi => vi.ImageType == "Cover")?.ImageUrl ?? images.FirstOrDefault(vi => vi.ImageType == "Gallery")?.ImageUrl,
            SportTypes = venue.SportTypes,
            BankQrUrl = venue.BankQrUrl,
            ContactPhone = venue.ContactPhone,
            ContactPhone2 = venue.ContactPhone2,
            GalleryImages = gallery,
            Courts = courts.Select(c => new PublicCourtDto
            {
                Id = c.Id,
                CourtName = c.CourtName,
                Status = c.Status,
                SportType = c.SportType
            }).ToList(),
            PriceRules = priceRules.Select(p => new PublicPriceRuleDto
            {
                DayOfWeek = p.DayOfWeek,
                StartHour = p.StartHour.ToString(@"hh\:mm"),
                EndHour = p.EndHour.ToString(@"hh\:mm"),
                Price = p.Price,
                Description = p.Description,
                SportType = p.SportType
            }).ToList()
        };
    }
}
