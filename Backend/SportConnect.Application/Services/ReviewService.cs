using SportConnect.Application.DTOs.Public;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ReviewDto>> GetVenueReviewsAsync(Guid venueId)
    {
        var reviews = await _unitOfWork.Repository<Review>().FindAsync(r => r.VenueId == venueId);
        var userIds = reviews.Select(r => r.UserId).ToHashSet();
        
        var users = (await _unitOfWork.Repository<User>().FindAsync(u => userIds.Contains(u.Id)))
            .ToDictionary(u => u.Id);

        return reviews.Select(r =>
        {
            users.TryGetValue(r.UserId, out var user);
            return new ReviewDto
            {
                Id = r.Id,
                VenueId = r.VenueId,
                UserId = r.UserId,
                UserName = user?.FullName ?? user?.Username ?? "Unknown",
                UserAvatar = user?.AvatarUrl,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            };
        }).OrderByDescending(r => r.CreatedAt).ToList();
    }

    public async Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new Exception("Rating must be between 1 and 5.");

        var booking = await _unitOfWork.Repository<Booking>().GetByIdAsync(dto.BookingId);
        if (booking == null)
            throw new Exception("Booking not found.");
            
        if (booking.BookerId != userId)
            throw new Exception("You can only review your own bookings.");
            
        if (booking.Status != "CONFIRMED") // Meaning completed/played
            throw new Exception("You can only review completed/confirmed bookings.");

        var existingReview = await _unitOfWork.Repository<Review>().FindAsync(r => r.BookingId == dto.BookingId);
        if (existingReview.Any())
            throw new Exception("You have already reviewed this booking.");

        var court = await _unitOfWork.Repository<Court>().GetByIdAsync(booking.CourtId);
        if (court == null) throw new Exception("Court not found.");

        var venue = await _unitOfWork.Repository<Venue>().GetByIdAsync(court.VenueId);
        if (venue == null) throw new Exception("Venue not found.");

        var review = new Review
        {
            UserId = userId,
            VenueId = venue.Id,
            BookingId = dto.BookingId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Review>().AddAsync(review);
        
        // Update Venue AverageRating and ReviewCount
        var allReviews = (await _unitOfWork.Repository<Review>().FindAsync(r => r.VenueId == venue.Id)).ToList();
        allReviews.Add(review); // Include the new one in calculation

        venue.ReviewCount = allReviews.Count;
        venue.AverageRating = Math.Round(allReviews.Average(r => r.Rating), 1);
        _unitOfWork.Repository<Venue>().Update(venue);

        await _unitOfWork.CompleteAsync();

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);

        return new ReviewDto
        {
            Id = review.Id,
            VenueId = review.VenueId,
            UserId = review.UserId,
            UserName = user?.FullName ?? user?.Username ?? "Unknown",
            UserAvatar = user?.AvatarUrl,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}
