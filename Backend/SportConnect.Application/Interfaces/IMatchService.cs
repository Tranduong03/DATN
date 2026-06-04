using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Public;

namespace SportConnect.Application.Interfaces;

public interface IMatchService
{
    Task<IEnumerable<MatchDto>> GetAllMatchesAsync(string? status);
    Task<MatchDto?> GetMatchByIdAsync(Guid matchId);
    Task<MatchDto> CreateMatchAsync(Guid userId, CreateMatchDto dto);
    Task<bool> JoinMatchAsync(Guid matchId, Guid userId);
    Task<bool> ApproveJoinRequestAsync(Guid matchId, Guid hostId, Guid joinUserId);
    Task<bool> RejectJoinRequestAsync(Guid matchId, Guid hostId, Guid joinUserId);
    Task<bool> LeaveMatchAsync(Guid matchId, Guid userId);
    Task<bool> CancelMatchAsync(Guid matchId, Guid hostId);
}
