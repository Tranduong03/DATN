using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.User;
using SportConnect.Application.DTOs.Recommendation;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.DTOs.Team;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMatchService _matchService;

    public UserService(IUnitOfWork unitOfWork, IMatchService matchService)
    {
        _unitOfWork = unitOfWork;
        _matchService = matchService;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) return null;

        return MapToProfileDto(user);
    }

    public async Task<UserProfileDto> UpdateUserProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) throw new Exception("User not found");

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.Height != null) user.Height = dto.Height;
        if (dto.Weight != null) user.Weight = dto.Weight;
        if (dto.SpecialNotes != null) user.SpecialNotes = dto.SpecialNotes;
        if (dto.FavPosition != null) user.FavPosition = dto.FavPosition;
        if (dto.SportsLevel != null) user.SportsLevel = dto.SportsLevel;
        if (dto.Goals != null) user.Goals = dto.Goals;
        if (dto.Frequency != null) user.Frequency = dto.Frequency;
        if (dto.PreferredSports != null) user.PreferredSports = dto.PreferredSports;
        if (dto.PreferredLocations != null) user.PreferredLocations = dto.PreferredLocations;

        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.CompleteAsync();

        return MapToProfileDto(user);
    }

    public async Task<IEnumerable<MatchRecommendationDto>> GetMatchRecommendationsAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) throw new Exception("User not found");

        // Get all matches
        var allMatches = (await _matchService.GetAllMatchesAsync("OPEN")).ToList();

        // Get user's preferred sports & locations
        var userSports = ParseJsonList(user.PreferredSports);
        if (!userSports.Any() && !string.IsNullOrEmpty(user.SportsLevel))
        {
            // Try extracting from sports level which might be e.g. "Cầu lông - Trung bình"
            var parts = user.SportsLevel.Split('-');
            if (parts.Length > 0)
            {
                userSports.Add(parts[0].Trim());
            }
        }
        // Fallback: If no sports preference, check user's favorite venues' sports or historical bookings
        if (!userSports.Any())
        {
            var favorites = await _unitOfWork.Repository<FavoriteVenue>().FindAsync(fv => fv.UserId == userId);
            foreach (var fav in favorites)
            {
                var venue = await _unitOfWork.Repository<Venue>().GetByIdAsync(fav.VenueId);
                if (venue != null && venue.SportTypes != null)
                {
                    userSports.AddRange(venue.SportTypes);
                }
            }
            userSports = userSports.Distinct().ToList();
        }

        var userLocations = ParseJsonList(user.PreferredLocations);
        if (!userLocations.Any() && !string.IsNullOrEmpty(user.FavPosition))
        {
            userLocations.Add(user.FavPosition);
        }

        var recommendations = new List<MatchRecommendationDto>();

        foreach (var match in allMatches)
        {
            // Don't recommend user's own hosted matches or matches they already joined
            if (match.HostId == userId || match.Players.Any(p => p.UserId == userId))
            {
                continue;
            }

            double score = 0;
            var reasons = new List<string>();

            // Need to retrieve venue to check sport type
            var booking = match.BookingId.HasValue ? await _unitOfWork.Repository<Booking>().GetByIdAsync(match.BookingId.Value) : null;
            var court = booking != null ? await _unitOfWork.Repository<Court>().GetByIdAsync(booking.CourtId) : null;
            var venue = court != null ? await _unitOfWork.Repository<Venue>().GetByIdAsync(court.VenueId) : null;

            bool sportMatched = false;
            if (venue != null && venue.SportTypes != null)
            {
                foreach (var userSport in userSports)
                {
                    if (venue.SportTypes.Any(st => st.Equals(userSport, StringComparison.OrdinalIgnoreCase) || 
                                                  userSport.Contains(st) || st.Contains(userSport)))
                    {
                        score += 40;
                        reasons.Add($"Môn thể thao yêu thích: {userSport}");
                        sportMatched = true;
                        break;
                    }
                }
            }

            if (!sportMatched && userSports.Any())
            {
                // Partial matching using match title
                foreach (var userSport in userSports)
                {
                    if (match.Title.Contains(userSport, StringComparison.OrdinalIgnoreCase))
                    {
                        score += 30;
                        reasons.Add($"Tiêu đề kèo chứa môn thể thao ưu thích: {userSport}");
                        sportMatched = true;
                        break;
                    }
                }
            }

            // 2. Skill Level Match (30 points max)
            if (!string.IsNullOrEmpty(match.SkillLevel))
            {
                string cleanUserLevel = ExtractSkillLevel(user.SportsLevel);
                string cleanMatchLevel = ExtractSkillLevel(match.SkillLevel);

                if (cleanUserLevel.Equals(cleanMatchLevel, StringComparison.OrdinalIgnoreCase))
                {
                    score += 30;
                    reasons.Add($"Phù hợp trình độ: {match.SkillLevel}");
                }
                else if (cleanMatchLevel.Equals("OPEN", StringComparison.OrdinalIgnoreCase) || 
                         cleanMatchLevel.Equals("ALL", StringComparison.OrdinalIgnoreCase))
                {
                    score += 20;
                    reasons.Add("Kèo giao lưu mọi trình độ");
                }
                else
                {
                    // minor points for close levels
                    score += 10;
                    reasons.Add($"Trình độ đề xuất: {match.SkillLevel}");
                }
            }
            else
            {
                score += 15;
                reasons.Add("Kèo đấu tự do");
            }

            // 3. Location Match (20 points max)
            bool locationMatched = false;
            if (venue != null)
            {
                foreach (var loc in userLocations)
                {
                    if (venue.Address.Contains(loc, StringComparison.OrdinalIgnoreCase))
                    {
                        score += 20;
                        reasons.Add($"Địa điểm thuận tiện: {loc}");
                        locationMatched = true;
                        break;
                    }
                }
            }

            if (!locationMatched && venue != null)
            {
                // Default reason showing address district
                var district = ExtractDistrict(venue.Address);
                if (!string.IsNullOrEmpty(district))
                {
                    reasons.Add($"Địa điểm: {district}");
                    score += 10;
                }
            }

            // 4. Host Trust Score (10 points max)
            var host = await _unitOfWork.Repository<User>().GetByIdAsync(match.HostId);
            if (host != null)
            {
                double hostScore = host.TrustScore * 2; // e.g. 5.0 * 2 = 10 points
                score += hostScore;
                if (host.TrustScore >= 4.8)
                {
                    reasons.Add("Người tổ chức uy tín cao ⭐");
                }
            }

            recommendations.Add(new MatchRecommendationDto
            {
                Match = match,
                MatchScore = Math.Min(100, Math.Round(score)),
                MatchReasons = reasons.Distinct().ToList()
            });
        }

        return recommendations.OrderByDescending(r => r.MatchScore).Take(10);
    }

    public async Task<IEnumerable<TeamRecommendationDto>> GetTeamRecommendationsAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) throw new Exception("User not found");

        var allTeams = (await _unitOfWork.Repository<Team>().FindAsync(t => t.Status == "ACTIVE")).ToList();
        var userMemberships = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.UserId == userId)).ToList();
        var joinedTeamIds = userMemberships.Select(m => m.TeamId).ToHashSet();

        var userSports = ParseJsonList(user.PreferredSports);
        if (!userSports.Any() && !string.IsNullOrEmpty(user.SportsLevel))
        {
            var parts = user.SportsLevel.Split('-');
            if (parts.Length > 0) userSports.Add(parts[0].Trim());
        }

        var userLocations = ParseJsonList(user.PreferredLocations);
        if (!userLocations.Any() && !string.IsNullOrEmpty(user.FavPosition))
        {
            userLocations.Add(user.FavPosition);
        }

        var recommendations = new List<TeamRecommendationDto>();

        foreach (var team in allTeams)
        {
            // Don't recommend teams user has already joined
            if (joinedTeamIds.Contains(team.Id) || team.CreatorId == userId)
            {
                continue;
            }

            double score = 0;
            var reasons = new List<string>();

            // 1. Sport Category Match (45 points)
            if (!string.IsNullOrEmpty(team.SportType))
            {
                bool matched = false;
                foreach (var userSport in userSports)
                {
                    if (team.SportType.Equals(userSport, StringComparison.OrdinalIgnoreCase) || 
                        team.SportType.Contains(userSport, StringComparison.OrdinalIgnoreCase) || 
                        userSport.Contains(team.SportType, StringComparison.OrdinalIgnoreCase))
                    {
                        score += 45;
                        reasons.Add($"Nhóm chơi môn yêu thích của bạn: {team.SportType}");
                        matched = true;
                        break;
                    }
                }

                if (!matched && !userSports.Any())
                {
                    score += 20; // baseline if no preferences set
                }
            }

            // 2. Skill Level Match (30 points)
            if (!string.IsNullOrEmpty(team.SkillLevel))
            {
                string cleanUserLevel = ExtractSkillLevel(user.SportsLevel);
                string cleanTeamLevel = ExtractSkillLevel(team.SkillLevel);

                if (cleanUserLevel.Equals(cleanTeamLevel, StringComparison.OrdinalIgnoreCase))
                {
                    score += 30;
                    reasons.Add($"Cùng trình độ thành viên: {team.SkillLevel}");
                }
                else
                {
                    score += 15;
                    reasons.Add($"Yêu cầu trình độ: {team.SkillLevel}");
                }
            }
            else
            {
                score += 15;
                reasons.Add("Nhóm mở rộng cho mọi trình độ");
            }

            // 3. Location Match (25 points)
            if (!string.IsNullOrEmpty(team.Location))
            {
                bool matched = false;
                foreach (var loc in userLocations)
                {
                    if (team.Location.Contains(loc, StringComparison.OrdinalIgnoreCase) || 
                        loc.Contains(team.Location, StringComparison.OrdinalIgnoreCase))
                    {
                        score += 25;
                        reasons.Add($"Khu vực hoạt động thuận tiện: {team.Location}");
                        matched = true;
                        break;
                    }
                }

                if (!matched)
                {
                    score += 10;
                    reasons.Add($"Khu vực: {team.Location}");
                }
            }
            else
            {
                score += 10;
            }

            // Map Team entity to TeamDto
            var teamMembers = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.TeamId == team.Id)).ToList();
            var creator = await _unitOfWork.Repository<User>().GetByIdAsync(team.CreatorId);
            var users = (await _unitOfWork.Repository<User>().FindAsync(u => teamMembers.Select(tm => tm.UserId).Contains(u.Id))).ToDictionary(u => u.Id);

            var memberDtos = teamMembers.Select(m =>
            {
                users.TryGetValue(m.UserId, out var u);
                return new TeamMemberDto
                {
                    UserId = m.UserId,
                    UserName = u?.FullName ?? u?.Username ?? "Unknown Member",
                    UserAvatarUrl = u?.AvatarUrl,
                    Role = m.Role,
                    Status = m.Status,
                    JoinedAt = m.JoinedAt
                };
            }).ToList();

            var teamDto = new TeamDto
            {
                Id = team.Id,
                Name = team.Name,
                Description = team.Description,
                SportType = team.SportType,
                AvatarUrl = team.AvatarUrl,
                CreatorId = team.CreatorId,
                CreatorName = creator?.FullName ?? creator?.Username ?? "Unknown Creator",
                CreatedAt = team.CreatedAt,
                SkillLevel = team.SkillLevel,
                Location = team.Location,
                Status = team.Status,
                MemberCount = memberDtos.Count(m => m.Status == "APPROVED"),
                Members = memberDtos
            };

            recommendations.Add(new TeamRecommendationDto
            {
                Team = teamDto,
                MatchScore = Math.Min(100, Math.Round(score)),
                MatchReasons = reasons.Distinct().ToList()
            });
        }

        return recommendations.OrderByDescending(r => r.MatchScore).Take(10);
    }

    public async Task<MatchDto?> QuickMatchAsync(Guid userId, QuickMatchRequestDto dto)
    {
        var allMatches = (await _matchService.GetAllMatchesAsync("OPEN")).ToList();

        // Filter by sport type, skill level, and optionally location
        var query = allMatches.Where(m => !m.Players.Any(p => p.UserId == userId) && m.HostId != userId);

        if (!string.IsNullOrEmpty(dto.SportType))
        {
            query = query.Where(m => m.Title.Contains(dto.SportType, StringComparison.OrdinalIgnoreCase) || 
                                     m.VenueName.Contains(dto.SportType, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(dto.SkillLevel))
        {
            string cleanReqLevel = ExtractSkillLevel(dto.SkillLevel);
            query = query.Where(m => {
                string cleanMatchLevel = ExtractSkillLevel(m.SkillLevel);
                return cleanMatchLevel.Equals(cleanReqLevel, StringComparison.OrdinalIgnoreCase) || 
                       cleanMatchLevel.Equals("OPEN", StringComparison.OrdinalIgnoreCase) || 
                       cleanMatchLevel.Equals("ALL", StringComparison.OrdinalIgnoreCase);
            });
        }

        if (!string.IsNullOrEmpty(dto.PreferredLocation))
        {
            query = query.Where(m => m.VenueName.Contains(dto.PreferredLocation, StringComparison.OrdinalIgnoreCase));
        }

        // Return the first match or match with highest space available
        return query.OrderByDescending(m => m.MaxPlayers - m.CurrentPlayers).FirstOrDefault();
    }

    private UserProfileDto MapToProfileDto(User user)
    {
        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            AvatarUrl = user.AvatarUrl,
            Height = user.Height,
            Weight = user.Weight,
            SpecialNotes = user.SpecialNotes,
            FavPosition = user.FavPosition,
            SportsLevel = user.SportsLevel,
            Goals = user.Goals,
            Frequency = user.Frequency,
            PreferredSports = user.PreferredSports,
            PreferredLocations = user.PreferredLocations
        };
    }

    private List<string> ParseJsonList(string? json)
    {
        if (string.IsNullOrEmpty(json)) return new List<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            // Fallback if it's comma-separated
            return json.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList();
        }
    }

    private string ExtractSkillLevel(string? rawLevel)
    {
        if (string.IsNullOrEmpty(rawLevel)) return "OPEN";
        
        string upper = rawLevel.ToUpper();
        if (upper.Contains("BEGINNER") || upper.Contains("CƠ BẢN") || upper.Contains("MỚI CHƠI") || upper.Contains("YẾU"))
            return "BEGINNER";
        if (upper.Contains("INTERMEDIATE") || upper.Contains("TRUNG BÌNH") || upper.Contains("KHÁ"))
            return "INTERMEDIATE";
        if (upper.Contains("ADVANCED") || upper.Contains("NÂNG CAO") || upper.Contains("GIỎI") || upper.Contains("XUẤT SẮC"))
            return "ADVANCED";

        return "OPEN";
    }

    private string ExtractDistrict(string address)
    {
        if (string.IsNullOrEmpty(address)) return string.Empty;
        
        var parts = address.Split(',');
        if (parts.Length > 1)
        {
            // Usually district is the second to last or third to last part in VN address format
            for (int i = parts.Length - 1; i >= 0; i--)
            {
                var clean = parts[i].Trim();
                if (clean.StartsWith("Quận", StringComparison.OrdinalIgnoreCase) || 
                    clean.StartsWith("Q.", StringComparison.OrdinalIgnoreCase) || 
                    clean.StartsWith("Huyện", StringComparison.OrdinalIgnoreCase) || 
                    clean.StartsWith("Thị xã", StringComparison.OrdinalIgnoreCase))
                {
                    return clean;
                }
            }
        }
        return string.Empty;
    }
}
