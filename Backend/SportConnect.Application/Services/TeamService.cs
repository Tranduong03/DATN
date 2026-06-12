using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Team;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class TeamService : ITeamService
{
    private readonly IUnitOfWork _unitOfWork;

    public TeamService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<TeamDto>> GetAllTeamsAsync(string? sportType, string? skillLevel)
    {
        var teams = (await _unitOfWork.Repository<Team>().GetAllAsync()).ToList();

        if (!string.IsNullOrEmpty(sportType))
        {
            teams = teams.Where(t => t.SportType != null && t.SportType.Equals(sportType, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (!string.IsNullOrEmpty(skillLevel))
        {
            teams = teams.Where(t => t.SkillLevel != null && t.SkillLevel.Equals(skillLevel, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        var teamDtos = new List<TeamDto>();

        foreach (var team in teams)
        {
            var dto = await MapToTeamDtoAsync(team);
            if (dto != null)
            {
                teamDtos.Add(dto);
            }
        }

        return teamDtos;
    }

    public async Task<TeamDto?> GetTeamByIdAsync(Guid teamId)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team == null) return null;

        return await MapToTeamDtoAsync(team);
    }

    public async Task<TeamDto> CreateTeamAsync(Guid userId, CreateTeamDto dto)
    {
        var creator = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (creator == null) throw new Exception("Creator user not found");

        var team = new Team
        {
            Name = dto.Name,
            Description = dto.Description,
            SportType = dto.SportType,
            AvatarUrl = dto.AvatarUrl,
            CreatorId = userId,
            SkillLevel = dto.SkillLevel,
            Location = dto.Location,
            Status = "ACTIVE",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Team>().AddAsync(team);
        await _unitOfWork.CompleteAsync();

        // Creator joins as Captain and Approved member
        var member = new TeamMember
        {
            TeamId = team.Id,
            UserId = userId,
            Role = "CAPTAIN",
            Status = "APPROVED",
            JoinedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<TeamMember>().AddAsync(member);
        await _unitOfWork.CompleteAsync();

        return await GetTeamByIdAsync(team.Id) ?? throw new Exception("Failed to retrieve created team");
    }

    public async Task<TeamDto> UpdateTeamAsync(Guid teamId, Guid userId, UpdateTeamDto dto)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team == null) throw new Exception("Team not found");
        if (team.CreatorId != userId) throw new Exception("Only the creator can update the team settings");

        team.Name = dto.Name;
        team.Description = dto.Description;
        team.SportType = dto.SportType;
        team.AvatarUrl = dto.AvatarUrl;
        team.SkillLevel = dto.SkillLevel;
        team.Location = dto.Location;

        _unitOfWork.Repository<Team>().Update(team);
        await _unitOfWork.CompleteAsync();

        return await GetTeamByIdAsync(team.Id) ?? throw new Exception("Failed to retrieve updated team");
    }

    public async Task<bool> DeleteTeamAsync(Guid teamId, Guid userId)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team == null) throw new Exception("Team not found");
        if (team.CreatorId != userId) throw new Exception("Only the creator can delete the team");

        _unitOfWork.Repository<Team>().Remove(team);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> JoinTeamAsync(Guid teamId, Guid userId)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team == null) throw new Exception("Team not found");

        var existing = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.TeamId == teamId && tm.UserId == userId)).FirstOrDefault();
        if (existing != null)
        {
            if (existing.Status == "APPROVED") throw new Exception("Already a member of this team");
            if (existing.Status == "PENDING") throw new Exception("Join request already pending approval");
            // If rejected, allow joining again
            existing.Status = "PENDING";
            existing.JoinedAt = DateTime.UtcNow;
            _unitOfWork.Repository<TeamMember>().Update(existing);
        }
        else
        {
            var member = new TeamMember
            {
                TeamId = teamId,
                UserId = userId,
                Role = "MEMBER",
                Status = "PENDING",
                JoinedAt = DateTime.UtcNow
            };
            await _unitOfWork.Repository<TeamMember>().AddAsync(member);
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> LeaveTeamAsync(Guid teamId, Guid userId)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team == null) throw new Exception("Team not found");
        if (team.CreatorId == userId) throw new Exception("Creator cannot leave the team. You must delete the team or transfer ownership first.");

        var member = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.TeamId == teamId && tm.UserId == userId)).FirstOrDefault();
        if (member == null) throw new Exception("You are not a member of this team");

        _unitOfWork.Repository<TeamMember>().Remove(member);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> ApproveMemberAsync(Guid teamId, Guid captainId, Guid memberId)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team == null) throw new Exception("Team not found");

        // Verify captain authority
        var captain = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.TeamId == teamId && tm.UserId == captainId && tm.Role == "CAPTAIN" && tm.Status == "APPROVED")).FirstOrDefault();
        if (captain == null) throw new Exception("Unauthorized. Only captains can manage team members.");

        var member = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.TeamId == teamId && tm.UserId == memberId)).FirstOrDefault();
        if (member == null) throw new Exception("Membership request not found");

        member.Status = "APPROVED";
        _unitOfWork.Repository<TeamMember>().Update(member);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> RejectMemberAsync(Guid teamId, Guid captainId, Guid memberId)
    {
        var team = await _unitOfWork.Repository<Team>().GetByIdAsync(teamId);
        if (team == null) throw new Exception("Team not found");

        var captain = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.TeamId == teamId && tm.UserId == captainId && tm.Role == "CAPTAIN" && tm.Status == "APPROVED")).FirstOrDefault();
        if (captain == null) throw new Exception("Unauthorized. Only captains can manage team members.");

        var member = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.TeamId == teamId && tm.UserId == memberId)).FirstOrDefault();
        if (member == null) throw new Exception("Membership request not found");

        member.Status = "REJECTED";
        _unitOfWork.Repository<TeamMember>().Update(member);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<IEnumerable<TeamDto>> GetUserTeamsAsync(Guid userId)
    {
        var memberships = await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.UserId == userId);
        var teamIds = memberships.Select(m => m.TeamId).ToHashSet();

        var teams = (await _unitOfWork.Repository<Team>().FindAsync(t => teamIds.Contains(t.Id) || t.CreatorId == userId)).ToList();

        var teamDtos = new List<TeamDto>();
        foreach (var team in teams)
        {
            var dto = await MapToTeamDtoAsync(team);
            if (dto != null)
            {
                teamDtos.Add(dto);
            }
        }

        return teamDtos;
    }

    private async Task<TeamDto?> MapToTeamDtoAsync(Team team)
    {
        var creator = await _unitOfWork.Repository<User>().GetByIdAsync(team.CreatorId);
        var members = (await _unitOfWork.Repository<TeamMember>().FindAsync(tm => tm.TeamId == team.Id)).ToList();
        var memberUserIds = members.Select(m => m.UserId).ToHashSet();
        var users = (await _unitOfWork.Repository<User>().FindAsync(u => memberUserIds.Contains(u.Id))).ToDictionary(u => u.Id);

        var memberDtos = members.Select(m =>
        {
            users.TryGetValue(m.UserId, out var user);
            return new TeamMemberDto
            {
                UserId = m.UserId,
                UserName = user?.FullName ?? user?.Username ?? "Unknown Member",
                UserAvatarUrl = user?.AvatarUrl,
                Role = m.Role,
                Status = m.Status,
                JoinedAt = m.JoinedAt
            };
        }).ToList();

        return new TeamDto
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
    }
}
