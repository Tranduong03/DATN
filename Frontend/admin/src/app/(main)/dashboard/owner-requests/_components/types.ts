export type OwnerRequestDto = {
  userId: string;
  fullName: string | null;
  username: string;
  email: string;
  avatarUrl: string | null;
  verificationStatus: string;
  submittedAt: string;
  venueName: string | null;
  venueAddress: string | null;
};

export type OwnerRequestDetailDto = {
  userId: string;
  username: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  trustScore: number;
  userCreatedAt: string;
  verificationStatus: string;
  onboardingStatus: string;
  rejectReason: string | null;
  submittedAt: string;
  draftData: string | null;
  venueId: string | null;
  venueName: string | null;
  venueAddress: string | null;
  venuePhone: string | null;
  description: string | null;
  operatingStartHour: string | null;
  operatingEndHour: string | null;
  sportTypes: string[];
  venueScale: number;
  venueStatus: string | null;
  venueImages: string[];
};
