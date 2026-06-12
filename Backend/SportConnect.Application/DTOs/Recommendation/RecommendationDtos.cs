using System.Collections.Generic;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.DTOs.Team;

namespace SportConnect.Application.DTOs.Recommendation;

public class MatchRecommendationDto
{
    public MatchDto Match { get; set; } = null!;
    public double MatchScore { get; set; } // 0 to 100
    public List<string> MatchReasons { get; set; } = new();
}

public class TeamRecommendationDto
{
    public TeamDto Team { get; set; } = null!;
    public double MatchScore { get; set; } // 0 to 100
    public List<string> MatchReasons { get; set; } = new();
}

public class QuickMatchRequestDto
{
    public string SportType { get; set; } = string.Empty;
    public string SkillLevel { get; set; } = string.Empty;
    public string? PreferredLocation { get; set; }
}
