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

        var bookingIds = query.Where(m => m.BookingId.HasValue).Select(m => m.BookingId!.Value).ToHashSet();
        var bookings = bookingIds.Any()
            ? (await _unitOfWork.Repository<Booking>().FindAsync(b => bookingIds.Contains(b.Id))).ToDictionary(b => b.Id)
            : new Dictionary<Guid, Booking>();
        
        var courtIds = bookings.Values.Select(b => b.CourtId).ToHashSet();
        var courts = courtIds.Any()
            ? (await _unitOfWork.Repository<Court>().FindAsync(c => courtIds.Contains(c.Id))).ToDictionary(c => c.Id)
            : new Dictionary<Guid, Court>();
        
        var venueIds = courts.Values.Select(c => c.VenueId).ToHashSet();
        var venues = venueIds.Any()
            ? (await _unitOfWork.Repository<Venue>().FindAsync(v => venueIds.Contains(v.Id))).ToDictionary(v => v.Id)
            : new Dictionary<Guid, Venue>();

        return query.Select(m =>
        {
            Booking? booking = null;
            if (m.BookingId.HasValue)
            {
                bookings.TryGetValue(m.BookingId.Value, out booking);
            }
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
                    JoinedAt = mp.JoinedAt,
                    IsGuest = pUser?.Email?.EndsWith("@sportconnect.guest") ?? false
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
                CurrentPlayers = players.Count(p => p.Status == "APPROVED" || p.Status == "ATTENDED" || p.Status == "NO_SHOW") + 1, // +1 for host
                FeePerPlayer = m.FeePerPlayer,
                Status = m.Status,
                CreatedAt = m.CreatedAt,
                VenueName = venue?.Name ?? m.CustomVenueName ?? "N/A",
                CourtName = court?.CourtName ?? m.CustomCourtName ?? "N/A",
                StartTime = booking?.StartTime ?? m.CustomStartTime ?? DateTime.MinValue,
                EndTime = booking?.EndTime ?? m.CustomEndTime ?? DateTime.MinValue,
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

        var booking = match.BookingId.HasValue ? await _unitOfWork.Repository<Booking>().GetByIdAsync(match.BookingId.Value) : null;
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
                JoinedAt = mp.JoinedAt,
                IsGuest = pUser?.Email?.EndsWith("@sportconnect.guest") ?? false
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
            CurrentPlayers = players.Count(p => p.Status == "APPROVED" || p.Status == "ATTENDED" || p.Status == "NO_SHOW") + 1,
            FeePerPlayer = match.FeePerPlayer,
            Status = match.Status,
            CreatedAt = match.CreatedAt,
            VenueName = venue?.Name ?? match.CustomVenueName ?? "N/A",
            CourtName = court?.CourtName ?? match.CustomCourtName ?? "N/A",
            StartTime = booking?.StartTime ?? match.CustomStartTime ?? DateTime.MinValue,
            EndTime = booking?.EndTime ?? match.CustomEndTime ?? DateTime.MinValue,
            Players = players
        };
    }

    public async Task<MatchDto> CreateMatchAsync(Guid userId, CreateMatchDto dto)
    {
        if (dto.BookingId.HasValue && dto.BookingId.Value != Guid.Empty)
        {
            var booking = await _unitOfWork.Repository<Booking>().GetByIdAsync(dto.BookingId.Value);
            if (booking == null) throw new Exception("Booking not found");
            if (booking.BookerId != userId) throw new Exception("Only the booker can create a match");
        }

        var match = new Match
        {
            BookingId = dto.BookingId == Guid.Empty ? null : dto.BookingId,
            HostId = userId,
            Title = dto.Title,
            SkillLevel = dto.SkillLevel,
            MaxPlayers = dto.MaxPlayers,
            FeePerPlayer = dto.FeePerPlayer,
            Status = "OPEN",
            CreatedAt = DateTime.UtcNow,
            CustomVenueName = dto.CustomVenueName,
            CustomCourtName = dto.CustomCourtName,
            CustomStartTime = dto.CustomStartTime,
            CustomEndTime = dto.CustomEndTime,
            SportType = dto.SportType
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
        var players = await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId && (mp.Status == "APPROVED" || mp.Status == "ATTENDED" || mp.Status == "NO_SHOW"));
        if (players.Count() + 1 >= match.MaxPlayers)
        {
            match.Status = "FULL";
            _unitOfWork.Repository<Match>().Update(match);
            await _unitOfWork.CompleteAsync();
        }

        return true;
    }

    public async Task<bool> RejectJoinRequestAsync(Guid matchId, Guid hostId, Guid joinUserId)
    {
        var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
        if (match == null) throw new Exception("Match not found");
        if (match.HostId != hostId) throw new Exception("Unauthorized");

        var existing = await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId && mp.UserId == joinUserId);
        var matchPlayer = existing.FirstOrDefault();
        if (matchPlayer == null) throw new Exception("Request not found");

        matchPlayer.Status = "REJECTED";
        _unitOfWork.Repository<MatchPlayer>().Update(matchPlayer);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> LeaveMatchAsync(Guid matchId, Guid userId)
    {
        var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
        if (match == null) throw new Exception("Match not found");
        if (match.HostId == userId) throw new Exception("Host cannot leave their own match. Use Cancel instead.");

        var existing = await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId && mp.UserId == userId);
        var matchPlayer = existing.FirstOrDefault();
        if (matchPlayer == null) throw new Exception("You are not part of this match");

        var wasApproved = matchPlayer.Status == "APPROVED" || matchPlayer.Status == "ATTENDED" || matchPlayer.Status == "NO_SHOW";

        _unitOfWork.Repository<MatchPlayer>().Remove(matchPlayer);
        await _unitOfWork.CompleteAsync();

        if (wasApproved && match.Status == "FULL")
        {
            match.Status = "OPEN";
            _unitOfWork.Repository<Match>().Update(match);
            await _unitOfWork.CompleteAsync();
        }

        return true;
    }

    public async Task<bool> CancelMatchAsync(Guid matchId, Guid hostId)
    {
        var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
        if (match == null) throw new Exception("Match not found");
        if (match.HostId != hostId) throw new Exception("Unauthorized");

        match.Status = "CANCELLED";
        _unitOfWork.Repository<Match>().Update(match);

        var matchPlayers = await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId);
        foreach (var mp in matchPlayers)
        {
            mp.Status = "REJECTED";
            _unitOfWork.Repository<MatchPlayer>().Update(mp);
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> UpdateAttendanceAsync(Guid matchId, Guid hostId, Guid playerUserId, string status)
    {
        var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
        if (match == null) throw new Exception("Match not found");
        if (match.HostId != hostId) throw new Exception("Unauthorized");

        var existing = await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId && mp.UserId == playerUserId);
        var matchPlayer = existing.FirstOrDefault();
        if (matchPlayer == null) throw new Exception("Player not found in this match");

        if (matchPlayer.Status != "APPROVED" && matchPlayer.Status != "ATTENDED" && matchPlayer.Status != "NO_SHOW")
        {
            throw new Exception("Only approved players can be checked in");
        }

        if (status != "ATTENDED" && status != "NO_SHOW" && status != "APPROVED")
        {
            throw new Exception("Invalid attendance status");
        }

        matchPlayer.Status = status;
        _unitOfWork.Repository<MatchPlayer>().Update(matchPlayer);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<MatchPlayerDto> AddExternalPlayerAsync(Guid matchId, Guid hostId, string playerName)
    {
        var match = await _unitOfWork.Repository<Match>().GetByIdAsync(matchId);
        if (match == null) throw new Exception("Match not found");
        if (match.HostId != hostId) throw new Exception("Unauthorized");
        if (match.Status == "CANCELLED") throw new Exception("Match is cancelled");

        // Check if match is full
        var playersCount = (await _unitOfWork.Repository<MatchPlayer>().FindAsync(mp => mp.MatchId == matchId && (mp.Status == "APPROVED" || mp.Status == "ATTENDED" || mp.Status == "NO_SHOW"))).Count();
        if (playersCount + 1 >= match.MaxPlayers)
        {
            throw new Exception("Match is already full");
        }

        // Create guest user
        var guestUser = new User
        {
            Id = Guid.NewGuid(),
            Username = "guest_" + Guid.NewGuid().ToString("N").Substring(0, 8),
            Email = "guest_" + Guid.NewGuid().ToString("N").Substring(0, 8) + "@sportconnect.guest",
            FullName = playerName,
            PasswordHash = "",
            CreatedAt = DateTime.UtcNow
        };
        
        await _unitOfWork.Repository<User>().AddAsync(guestUser);
        
        var matchPlayer = new MatchPlayer
        {
            MatchId = matchId,
            UserId = guestUser.Id,
            Status = "APPROVED",
            JoinedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<MatchPlayer>().AddAsync(matchPlayer);
        await _unitOfWork.CompleteAsync();

        // Check if full now
        if (playersCount + 2 >= match.MaxPlayers)
        {
            match.Status = "FULL";
            _unitOfWork.Repository<Match>().Update(match);
            await _unitOfWork.CompleteAsync();
        }

        return new MatchPlayerDto
        {
            UserId = guestUser.Id,
            UserName = guestUser.FullName,
            Status = matchPlayer.Status,
            JoinedAt = matchPlayer.JoinedAt,
            IsGuest = true
        };
    }
}
