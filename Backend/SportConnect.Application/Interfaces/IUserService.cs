using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.User;
using SportConnect.Application.DTOs.Recommendation;
using SportConnect.Application.DTOs.Public;

namespace SportConnect.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileDto?> GetUserProfileAsync(Guid userId);
    Task<UserProfileDto> UpdateUserProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<IEnumerable<MatchRecommendationDto>> GetMatchRecommendationsAsync(Guid userId);
    Task<IEnumerable<TeamRecommendationDto>> GetTeamRecommendationsAsync(Guid userId);
    Task<MatchDto?> QuickMatchAsync(Guid userId, QuickMatchRequestDto dto);
}
