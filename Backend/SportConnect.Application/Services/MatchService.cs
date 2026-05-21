using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Public;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class MatchService : IMatchService
{
    private readonly IUnitOfWork _unitOfWork;

    public MatchService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<MatchDto>> GetAllMatchesAsync(string? status)
    {
        var query = await _unitOfWork.Repository<Match>().GetAllAsync();
        
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(m => m.Status == status).ToList();
        }

        var matchIds = query.Select(m => m.Id).ToHashSet();
        var matchPlayers = (await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => matchIds.Contains(mp.MatchId))).ToList();
        var userIds = query.Select(m => m.HostId).Union(matchPlayers.Select(mp => mp.UserId)).ToHashSet();
        var users = (await _unitOfWork.Repository<User>().FindAsync(u => userIds.Contains(u.Id))).ToDictionary(u => u.Id);

        var bookingIds = query.Select(m => m.BookingId).ToHashSet();
        var bookings = (await _unitOfWork.Repository<Booking>().FindAsync(b => bookingIds.Contains(b.Id))).ToDictionary(b => b.Id);
        
        var courtIds = bookings.Values.Select(b => b.CourtId).ToHashSet();
        var courts = (await _unitOfWork.Repository<Court>().FindAsync(c => courtIds.Contains(c.Id))).ToDictionary(c => c.Id);
        
        var venueIds = courts.Values.Select(c => c.VenueId).ToHashSet();
        var venues = (await _unitOfWork.Repository<Venue>().FindAsync(v => venueIds.Contains(v.Id))).ToDictionary(v => v.Id);

        return query.Select(m =>
        {
            bookings.TryGetValue(m.BookingId, out var booking);
            var court = booking != null && courts.TryGetValue(booking.CourtId, out var c) ? c : null;
            var venue = court != null && venues.TryGetValue(court.VenueId, out var v) ? v : null;
            users.TryGetValue(m.HostId, out var host);

            var players = matchPlayers.Where(mp => mp.MatchId == m.Id).Select(mp =>
            {
                users.TryGetValue(mp.UserId, out var pUser);
                return new MatchPlayerDto
                {
                    UserId = mp.UserId,
                    UserName = pUser?.FullName ?? pUser?.Username ?? "Unknown",
                    Status = mp.Status,
                    JoinedAt = mp.JoinedAt
                };
            }).ToList();

            return new MatchDto
            {
                Id = m.Id,
                BookingId = m.BookingId,
                HostId = m.HostId,
                HostName = host?.FullName ?? host?.Username ?? "Unknown",
                Title = m.Title,
                SkillLevel = m.SkillLevel,
                MaxPlayers = m.MaxPlayers,
                CurrentPlayers = players.Count(p => p.Status == "APPROVED") + 1, // +1 for host
                FeePerPlayer = m.FeePerPlayer,
                Status = m.Status,
                CreatedAt = m.CreatedAt,
                VenueName = venue?.Name ?? "N/A",
                CourtName = court?.CourtName ?? "N/A",
                StartTime = booking?.StartTime ?? DateTime.MinValue,
                EndTime = booking?.EndTime ?? DateTime.MinValue,
                Players = players
            };
        }).ToList();
    }

    public async Task<MatchDto?> GetMatchByIdAsync(Guid matchId)
    {
        var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
        if (match == null) return null;

        var matches = new List<Match> { match };
        
        var matchPlayers = (await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId)).ToList();
        var userIds = matchPlayers.Select(mp => mp.UserId).ToHashSet();
        userIds.Add(match.HostId);
        
        var users = (await _unitOfWork.Repository<User>().FindAsync(u => userIds.Contains(u.Id))).ToDictionary(u => u.Id);

        var booking = await _unitOfWork.Repository<Booking>().GetByIdAsync(match.BookingId);
        var court = booking != null ? await _unitOfWork.Repository<Court>().GetByIdAsync(booking.CourtId) : null;
        var venue = court != null ? await _unitOfWork.Repository<Venue>().GetByIdAsync(court.VenueId) : null;
        
        users.TryGetValue(match.HostId, out var host);
        
        var players = matchPlayers.Select(mp =>
        {
            users.TryGetValue(mp.UserId, out var pUser);
            return new MatchPlayerDto
            {
                UserId = mp.UserId,
                UserName = pUser?.FullName ?? pUser?.Username ?? "Unknown",
                Status = mp.Status,
                JoinedAt = mp.JoinedAt
            };
        }).ToList();

        return new MatchDto
        {
            Id = match.Id,
            BookingId = match.BookingId,
            HostId = match.HostId,
            HostName = host?.FullName ?? host?.Username ?? "Unknown",
            Title = match.Title,
            SkillLevel = match.SkillLevel,
            MaxPlayers = match.MaxPlayers,
            CurrentPlayers = players.Count(p => p.Status == "APPROVED") + 1,
            FeePerPlayer = match.FeePerPlayer,
            Status = match.Status,
            CreatedAt = match.CreatedAt,
            VenueName = venue?.Name ?? "N/A",
            CourtName = court?.CourtName ?? "N/A",
            StartTime = booking?.StartTime ?? DateTime.MinValue,
            EndTime = booking?.EndTime ?? DateTime.MinValue,
            Players = players
        };
    }

    public async Task<MatchDto> CreateMatchAsync(Guid userId, CreateMatchDto dto)
    {
        var booking = await _unitOfWork.Repository<Booking>().GetByIdAsync(dto.BookingId);
        if (booking == null) throw new Exception("Booking not found");
        if (booking.BookerId != userId) throw new Exception("Only the booker can create a match");

        var match = new Match
        {
            BookingId = dto.BookingId,
            HostId = userId,
            Title = dto.Title,
            SkillLevel = dto.SkillLevel,
            MaxPlayers = dto.MaxPlayers,
            FeePerPlayer = dto.FeePerPlayer,
            Status = "OPEN",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Match>().AddAsync(match);
        await _unitOfWork.CompleteAsync();

        return await GetMatchByIdAsync(match.Id) ?? throw new Exception("Failed to retrieve created match");
    }

    public async Task<bool> JoinMatchAsync(Guid matchId, Guid userId)
    {
        var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
        if (match == null) throw new Exception("Match not found");
        if (match.HostId == userId) throw new Exception("Host cannot join their own match");
        if (match.Status != "OPEN") throw new Exception("Match is no longer open");

        var existing = await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId && mp.UserId == userId);
        if (existing.Any()) throw new Exception("Already applied to join this match");

        var matchPlayer = new MatchPlayer
        {
            MatchId = matchId,
            UserId = userId,
            Status = "PENDING",
            JoinedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<MatchPlayer>().AddAsync(matchPlayer);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> ApproveJoinRequestAsync(Guid matchId, Guid hostId, Guid joinUserId)
    {
        var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
        if (match == null) throw new Exception("Match not found");
        if (match.HostId != hostId) throw new Exception("Unauthorized");

        var existing = await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId && mp.UserId == joinUserId);
        var matchPlayer = existing.FirstOrDefault();
        if (matchPlayer == null) throw new Exception("Request not found");

        matchPlayer.Status = "APPROVED";
        _unitOfWork.Repository<MatchPlayer>().Update(matchPlayer);
        await _unitOfWork.CompleteAsync();

        // Check if full
        var players = await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId && mp.Status == "APPROVED");
        if (players.Count() + 1 >= match.MaxPlayers)
        {
            match.Status = "FULL";
            _unitOfWork.Repository<Match>().Update(match);
            await _unitOfWork.CompleteAsync();
        }

        return true;
    }
}
