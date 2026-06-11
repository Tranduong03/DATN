using System.Text.Json;
using SportConnect.Application.DTOs.OwnerOnboarding;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class OwnerOnboardingService : IOwnerOnboardingService
{
    private readonly IUnitOfWork _unitOfWork;

    public OwnerOnboardingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OnboardingStatusDto> GetStatusAsync(Guid userId)
    {
        var profiles = await _unitOfWork.Repository<OwnerProfile>().FindAsync(p => p.UserId == userId);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return new OnboardingStatusDto
            {
                OnboardingStatus = "NotStarted",
                VerificationStatus = "None",
                CurrentStep = 1
            };
        }

        return new OnboardingStatusDto
        {
            OnboardingStatus = profile.OnboardingStatus,
            VerificationStatus = profile.VerificationStatus,
            CurrentStep = profile.CurrentStep,
            DraftData = profile.DraftData,
            RejectReason = profile.RejectReason
        };
    }

    public async Task<bool> SaveDraftAsync(Guid userId, SaveDraftDto dto)
    {
        var profiles = await _unitOfWork.Repository<OwnerProfile>().FindAsync(p => p.UserId == userId);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            profile = new OwnerProfile
            {
                UserId = userId,
                OnboardingStatus = "InProgress",
                CurrentStep = dto.Step,
                DraftData = dto.DraftData,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Repository<OwnerProfile>().AddAsync(profile);
        }
        else
        {
            profile.CurrentStep = dto.Step;
            profile.DraftData = dto.DraftData;
            profile.OnboardingStatus = "InProgress";
            profile.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Repository<OwnerProfile>().Update(profile);
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> SubmitAsync(Guid userId, string draftData)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var profiles = await _unitOfWork.Repository<OwnerProfile>().FindAsync(p => p.UserId == userId);
            var profile = profiles.FirstOrDefault();

            if (profile == null)
            {
                profile = new OwnerProfile
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Repository<OwnerProfile>().AddAsync(profile);
            }

            profile.OnboardingStatus = "Completed";
            profile.VerificationStatus = "Pending";
            profile.CurrentStep = 7;
            profile.DraftData = draftData;
            profile.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Repository<OwnerProfile>().Update(profile);

            // Parse JSON draftData to create Venue
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(draftData, options);

            if (data != null)
            {
                var venueName = data.TryGetValue("venueName", out var nameEl) ? nameEl.GetString() : "Unknown Venue";
                var address = data.TryGetValue("venueAddress", out var addressEl) ? addressEl.GetString() : "Unknown Address";
                var phone = data.TryGetValue("contactPhone", out var phoneEl) ? phoneEl.GetString() : null;
                var description = data.TryGetValue("description", out var descEl) ? descEl.GetString() : null;
                
                var startHour = data.TryGetValue("operatingStartHour", out var startEl) ? startEl.GetString() : "06:00";
                var endHour = data.TryGetValue("operatingEndHour", out var endEl) ? endEl.GetString() : "22:00";
                
                var scale = data.TryGetValue("venueScale", out var scaleEl) && scaleEl.ValueKind == JsonValueKind.Number ? scaleEl.GetInt32() : 1;

                var sportTypes = new List<string>();
                if (data.TryGetValue("sportTypes", out var sportsEl) && sportsEl.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in sportsEl.EnumerateArray())
                    {
                        var sport = item.GetString();
                        if (!string.IsNullOrEmpty(sport)) sportTypes.Add(sport);
                    }
                }

                var venue = new Venue
                {
                    OwnerId = userId,
                    Name = venueName ?? "Unknown Venue",
                    Address = address ?? "Unknown Address",
                    ContactPhone = phone,
                    Description = description,
                    OperatingStartHour = TimeSpan.TryParse(startHour, out var s) ? s : new TimeSpan(6, 0, 0),
                    OperatingEndHour = TimeSpan.TryParse(endHour, out var e) ? e : new TimeSpan(22, 0, 0),
                    SportTypes = sportTypes,
                    VenueScale = scale,
                    Status = "PENDING_APPROVAL"
                };

                await _unitOfWork.Repository<Venue>().AddAsync(venue);
                await _unitOfWork.CompleteAsync(); // Lưu venue trước để có venue.Id

                // Tự động thêm ảnh mặc định cho venue mới
                var defaultAvatar = new VenueImage
                {
                    VenueId = venue.Id,
                    ImageUrl = "/images/owner-default.webp",
                    ImageType = "Avatar"
                };
                var defaultCover = new VenueImage
                {
                    VenueId = venue.Id,
                    ImageUrl = "/images/bg-default.webp",
                    ImageType = "Cover"
                };
                await _unitOfWork.Repository<VenueImage>().AddAsync(defaultAvatar);
                await _unitOfWork.Repository<VenueImage>().AddAsync(defaultCover);
            }

            await _unitOfWork.CompleteAsync();
            await _unitOfWork.CommitTransactionAsync();
            return true;
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw new SportConnect.Core.Exceptions.AppException($"Đã xảy ra lỗi khi gửi yêu cầu đăng ký chủ sân: {ex.Message}");
        }
    }
}
