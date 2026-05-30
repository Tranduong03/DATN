using Microsoft.EntityFrameworkCore;
using SportConnect.Application.DTOs;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;
using SportConnect.Infrastructure.Persistence.Context;

namespace SportConnect.Infrastructure.Services;

public class FavoriteVenueService : IFavoriteVenueService
{
    private readonly MyDbContext _context;

    public FavoriteVenueService(MyDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FavoriteVenueDto>> GetFavoriteVenuesAsync(Guid userId)
    {
        return await _context.FavoriteVenues
            .Include(f => f.Venue)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FavoriteVenueDto
            {
                VenueId = f.VenueId,
                VenueName = f.Venue.Name,
                Address = f.Venue.Address,
                ImageUrl = null, // Có thể join với bảng ảnh sau
                Rating = 5.0, // Hardcode tạm thời
                MinPrice = f.Venue.PriceRules.Any() ? f.Venue.PriceRules.Min(pr => pr.Price) : 0,
                AddedAt = f.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<bool> ToggleFavoriteAsync(Guid userId, Guid venueId)
    {
        var existing = await _context.FavoriteVenues
            .FirstOrDefaultAsync(f => f.UserId == userId && f.VenueId == venueId);

        if (existing != null)
        {
            _context.FavoriteVenues.Remove(existing);
            await _context.SaveChangesAsync();
            return false; // Trạng thái mới: Không còn yêu thích
        }
        else
        {
            _context.FavoriteVenues.Add(new FavoriteVenue
            {
                UserId = userId,
                VenueId = venueId,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            return true; // Trạng thái mới: Đã yêu thích
        }
    }

    public async Task<bool> IsFavoriteAsync(Guid userId, Guid venueId)
    {
        return await _context.FavoriteVenues
            .AnyAsync(f => f.UserId == userId && f.VenueId == venueId);
    }
}
