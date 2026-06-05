export const queryKeys = {
  // Admin queries
  adminStats: ['adminStats'] as const,
  adminUsers: (page: number, search: string) => ['adminUsers', page, search] as const,
  ownerRequests: (status: string) => ['ownerRequests', status] as const,
  ownerRequestDetail: (id: string) => ['ownerRequestDetail', id] as const,

  // Owner queries
  onboardingStatus: ['onboardingStatus'] as const,
};
