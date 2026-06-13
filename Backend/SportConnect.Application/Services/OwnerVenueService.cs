using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Owner;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class OwnerVenueService : IOwnerVenueService
{
    private readonly IUnitOfWork _unitOfWork;

    public OwnerVenueService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    private async Task<bool> IsOwnerOfVenue(Guid venueId, Guid ownerId)
    {
        var venue = await _unitOfWork.Repository<Venue>().GetByIdAsync(venueId);
        return venue != null && venue.OwnerId == ownerId;
    }

    public async Task<IEnumerable<VenueDto>> GetMyVenuesAsync(Guid ownerId)
    {
        var venues = (await _unitOfWork.Repository<Venue>().FindAsync(v => v.OwnerId == ownerId)).ToList();
        if (!venues.Any()) return new List<VenueDto>();

        var venueIds = venues.Select(v => v.Id).ToList();
        var allImages = await _unitOfWork.Repository<VenueImage>().FindAsync(vi => venueIds.Contains(vi.VenueId));
        var imagesByVenue = allImages.GroupBy(vi => vi.VenueId).ToDictionary(g => g.Key, g => g.ToList());

        return venues.Select(v => new VenueDto
        {
            Id = v.Id,
            Name = v.Name,
            Address = v.Address,
            Description = v.Description,
            OperatingStartHour = v.OperatingStartHour.ToString(@"hh\:mm"),
            OperatingEndHour = v.OperatingEndHour.ToString(@"hh\:mm"),
            Status = v.Status,
            VenueScale = v.VenueScale,
            ContactPhone = v.ContactPhone,
            ContactPhone2 = v.ContactPhone2,
            BankQrUrl = v.BankQrUrl,
            SportTypes = v.SportTypes,
            Images = imagesByVenue.GetValueOrDefault(v.Id, new List<VenueImage>())
                .Select(img => new VenueImageDto
                {
                    Id = img.Id,
                    ImageUrl = img.ImageUrl,
                    ImageType = img.ImageType
                }).ToList()
        });
    }

    public async Task<VenueDto?> GetVenueDetailAsync(Guid venueId, Guid ownerId)
    {
        var venues = await _unitOfWork.Repository<Venue>().FindAsync(v => v.Id == venueId && v.OwnerId == ownerId);
        var v = venues.FirstOrDefault();
        if (v == null) return null;

        var images = await _unitOfWork.Repository<VenueImage>().FindAsync(vi => vi.VenueId == venueId);

        return new VenueDto
        {
            Id = v.Id,
            Name = v.Name,
            Address = v.Address,
            Description = v.Description,
            OperatingStartHour = v.OperatingStartHour.ToString(@"hh\:mm"),
            OperatingEndHour = v.OperatingEndHour.ToString(@"hh\:mm"),
            Status = v.Status,
            VenueScale = v.VenueScale,
            ContactPhone = v.ContactPhone,
            ContactPhone2 = v.ContactPhone2,
            BankQrUrl = v.BankQrUrl,
            SportTypes = v.SportTypes,
            Images = images.Select(img => new VenueImageDto
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                ImageType = img.ImageType
            }).ToList()
        };
    }

    public async Task<VenueDto?> UpdateVenueAsync(Guid venueId, Guid ownerId, UpdateVenueDto dto)
    {
        var venue = await _unitOfWork.Repository<Venue>().GetByIdAsync(venueId);
        if (venue == null || venue.OwnerId != ownerId)
            throw new Exception("Venue not found or unauthorized access.");

        venue.Name = dto.Name;
        venue.Address = dto.Address;
        venue.Description = dto.Description;
        venue.ContactPhone = dto.ContactPhone;
        venue.ContactPhone2 = dto.ContactPhone2;
        venue.BankQrUrl = dto.BankQrUrl;
        venue.OperatingStartHour = TimeSpan.Parse(dto.OperatingStartHour);
        venue.OperatingEndHour = TimeSpan.Parse(dto.OperatingEndHour);
        venue.SportTypes = dto.SportTypes;

        _unitOfWork.Repository<Venue>().Update(venue);
        await _unitOfWork.CompleteAsync();

        return await GetVenueDetailAsync(venueId, ownerId);
    }

    public async Task<VenueImageDto> AddVenueImageAsync(Guid venueId, Guid ownerId, AddVenueImageDto dto)
    {
        if (!await IsOwnerOfVenue(venueId, ownerId))
            throw new Exception("Unauthorized access to venue.");

        var venueImage = new VenueImage
        {
            VenueId = venueId,
            ImageUrl = dto.ImageUrl,
            ImageType = string.IsNullOrWhiteSpace(dto.ImageType) ? "Gallery" : dto.ImageType
        };

        await _unitOfWork.Repository<VenueImage>().AddAsync(venueImage);
        await _unitOfWork.CompleteAsync();

        return new VenueImageDto
        {
            Id = venueImage.Id,
            ImageUrl = venueImage.ImageUrl,
            ImageType = venueImage.ImageType
        };
    }

    public async Task<bool> DeleteVenueImageAsync(Guid venueId, Guid ownerId, Guid imageId)
    {
        if (!await IsOwnerOfVenue(venueId, ownerId))
            throw new Exception("Unauthorized access to venue.");

        var image = await _unitOfWork.Repository<VenueImage>().GetByIdAsync(imageId);
        if (image == null || image.VenueId != venueId)
            throw new Exception("Image not found in this venue.");

        _unitOfWork.Repository<VenueImage>().Remove(image);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<IEnumerable<CourtDto>> GetCourtsAsync(Guid venueId, Guid ownerId)
    {
        if (!await IsOwnerOfVenue(venueId, ownerId))
            throw new Exception("Unauthorized access to venue.");

        var courts = await _unitOfWork.Repository<Court>().FindAsync(c => c.VenueId == venueId);
        return courts.Select(c => new CourtDto
        {
            Id = c.Id,
            VenueId = c.VenueId,
            CourtName = c.CourtName,
            Status = c.Status
        });
    }

    public async Task<CourtDto> AddCourtAsync(Guid venueId, Guid ownerId, CreateCourtDto dto)
    {
        if (!await IsOwnerOfVenue(venueId, ownerId))
            throw new Exception("Unauthorized access to venue.");

        var court = new Court
        {
            VenueId = venueId,
            CourtName = dto.CourtName,
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "AVAILABLE" : dto.Status,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Court>().AddAsync(court);
        await _unitOfWork.CompleteAsync();

        return new CourtDto
        {
            Id = court.Id,
            VenueId = court.VenueId,
            CourtName = court.CourtName,
            Status = court.Status
        };
    }

    public async Task<CourtDto> UpdateCourtAsync(Guid venueId, Guid courtId, Guid ownerId, UpdateCourtDto dto)
    {
        if (!await IsOwnerOfVenue(venueId, ownerId))
            throw new Exception("Unauthorized access to venue.");

        var court = await _unitOfWork.Repository<Court>().GetByIdAsync(courtId);
        if (court == null || court.VenueId != venueId)
            throw new Exception("Court not found in this venue.");

        court.CourtName = dto.CourtName;
        court.Status = dto.Status;

        _unitOfWork.Repository<Court>().Update(court);
        await _unitOfWork.CompleteAsync();

        return new CourtDto
        {
            Id = court.Id,
            VenueId = court.VenueId,
            CourtName = court.CourtName,
            Status = court.Status
        };
    }

    public async Task<IEnumerable<PriceRuleDto>> GetPriceRulesAsync(Guid venueId, Guid ownerId)
    {
        if (!await IsOwnerOfVenue(venueId, ownerId))
            throw new Exception("Unauthorized access to venue.");

        var rules = await _unitOfWork.Repository<PriceRule>().FindAsync(p => p.VenueId == venueId);
        return rules.Select(p => new PriceRuleDto
        {
            Id = p.Id,
            DayOfWeek = p.DayOfWeek,
            StartHour = p.StartHour.ToString(@"hh\:mm"),
            EndHour = p.EndHour.ToString(@"hh\:mm"),
            Price = p.Price,
            Description = p.Description
        });
    }

    public async Task<bool> UpsertPriceRulesAsync(Guid venueId, Guid ownerId, List<UpsertPriceRuleDto> dtos)
    {
        if (!await IsOwnerOfVenue(venueId, ownerId))
            throw new Exception("Unauthorized access to venue.");

        // For simplicity, we can replace all existing rules or update them.
        // Option 1: Remove all current rules and insert new ones (safest for bulk updates)
        var existingRules = await _unitOfWork.Repository<PriceRule>().FindAsync(p => p.VenueId == venueId);
        _unitOfWork.Repository<PriceRule>().RemoveRange(existingRules);

        var newRules = dtos.Select(dto => new PriceRule
        {
            VenueId = venueId,
            DayOfWeek = dto.DayOfWeek,
            StartHour = TimeSpan.Parse(dto.StartHour),
            EndHour = TimeSpan.Parse(dto.EndHour),
            Price = dto.Price,
            Description = dto.Description
        });

        await _unitOfWork.Repository<PriceRule>().AddRangeAsync(newRules);
        await _unitOfWork.CompleteAsync();

        return true;
    }
}
