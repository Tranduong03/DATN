using SportConnect.Application.DTOs.Public;

namespace SportConnect.Application.Interfaces;

public interface IReviewService
{
    Task<List<ReviewDto>> GetVenueReviewsAsync(Guid venueId);
    Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewDto dto);
}
