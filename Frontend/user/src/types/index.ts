export interface ApiResponse<T> {
  isSuccess: boolean;
  message?: string;
  data: T;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  phone: string;
  dob: string;
  gender: string;
  roles: string[];
}

export interface UserProfileDbDto {
  height?: number;
  weight?: number;
  specialNotes?: string | null;
  favPosition?: string | null;
  sportsLevel?: string | null;
  goals?: string | null;
  frequency?: string | null;
}
