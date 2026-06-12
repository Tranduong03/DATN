using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Team;

namespace SportConnect.Application.Interfaces;

public interface ITeamService
{
    Task<IEnumerable<TeamDto>> GetAllTeamsAsync(string? sportType, string? skillLevel);
    Task<TeamDto?> GetTeamByIdAsync(Guid teamId);
    Task<TeamDto> CreateTeamAsync(Guid userId, CreateTeamDto dto);
    Task<TeamDto> UpdateTeamAsync(Guid teamId, Guid userId, UpdateTeamDto dto);
    Task<bool> DeleteTeamAsync(Guid teamId, Guid userId);
    Task<bool> JoinTeamAsync(Guid teamId, Guid userId);
    Task<bool> LeaveTeamAsync(Guid teamId, Guid userId);
    Task<bool> ApproveMemberAsync(Guid teamId, Guid captainId, Guid memberId);
    Task<bool> RejectMemberAsync(Guid teamId, Guid captainId, Guid memberId);
    Task<IEnumerable<TeamDto>> GetUserTeamsAsync(Guid userId);
}
