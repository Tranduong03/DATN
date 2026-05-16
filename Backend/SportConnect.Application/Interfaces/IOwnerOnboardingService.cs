using SportConnect.Application.DTOs.OwnerOnboarding;

namespace SportConnect.Application.Interfaces;

public interface IOwnerOnboardingService
{
    Task<OnboardingStatusDto> GetStatusAsync(Guid userId);
    Task<bool> SaveDraftAsync(Guid userId, SaveDraftDto dto);
    Task<bool> SubmitAsync(Guid userId, string draftData);
}
