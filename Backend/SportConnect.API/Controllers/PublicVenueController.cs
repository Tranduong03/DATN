using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/public/venues")]
[ApiController]
public class PublicVenueController : ControllerBase
{
    private readonly IPublicVenueService _publicVenueService;

    public PublicVenueController(IPublicVenueService publicVenueService)
    {
        _publicVenueService = publicVenueService;
    }

    [HttpGet]
    public async Task<IActionResult> GetVenues([FromQuery] string? search)
    {
        var venues = await _publicVenueService.GetActiveVenuesAsync(search);
        return Ok(new { isSuccess = true, data = venues });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVenueDetail(Guid id)
    {
        var venue = await _publicVenueService.GetVenueDetailAsync(id);
        if (venue == null) return NotFound(new { isSuccess = false, message = "Venue not found" });
        return Ok(new { isSuccess = true, data = venue });
    }

    [HttpPost("seed-demo")]
    public async Task<IActionResult> SeedDemo([FromServices] SportConnect.Application.Interfaces.IUnitOfWork unitOfWork)
    {
        var owner = new SportConnect.Core.Entities.User { Id = Guid.NewGuid(), Email = "owner@demo.com", Username = "owner", PasswordHash = "123", FullName = "Demo Owner", Status = true };
        var venue = new SportConnect.Core.Entities.Venue 
        { 
            Id = Guid.NewGuid(), OwnerId = owner.Id, Name = "Sân Pickleball Demo Siêu VIP", Address = "123 Quận 1, HCM", 
            OperatingStartHour = new TimeSpan(5, 0, 0), OperatingEndHour = new TimeSpan(22, 0, 0), 
            Status = "ACTIVE", VenueScale = 2, Description = "Sân siêu đẹp cho ae test E2E."
        };
        var court = new SportConnect.Core.Entities.Court { Id = Guid.NewGuid(), VenueId = venue.Id, CourtName = "Sân Trung Tâm", Status = "AVAILABLE" };
        var price = new SportConnect.Core.Entities.PriceRule { Id = Guid.NewGuid(), VenueId = venue.Id, StartHour = new TimeSpan(5, 0, 0), EndHour = new TimeSpan(22, 0, 0), Price = 150000 };
        
        await unitOfWork.Repository<SportConnect.Core.Entities.User>().AddAsync(owner);
        await unitOfWork.Repository<SportConnect.Core.Entities.Venue>().AddAsync(venue);
        await unitOfWork.Repository<SportConnect.Core.Entities.Court>().AddAsync(court);
        await unitOfWork.Repository<SportConnect.Core.Entities.PriceRule>().AddAsync(price);
        await unitOfWork.CompleteAsync();
        
        return Ok(new { isSuccess = true, message = "Đã seed xong Sân Demo!" });
    }
}
