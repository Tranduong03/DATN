using SportConnect.Application.DTOs;

namespace SportConnect.Application.Interfaces;

public interface IFavoriteVenueService
{
    Task<IEnumerable<FavoriteVenueDto>> GetFavoriteVenuesAsync(Guid userId);
    Task<bool> ToggleFavoriteAsync(Guid userId, Guid venueId);
    Task<bool> IsFavoriteAsync(Guid userId, Guid venueId);
}
