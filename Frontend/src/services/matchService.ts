import axiosClient from '../api/axiosClient';

export interface MatchPlayerDto {
  userId: string;
  userName: string;
  status: string;
  joinedAt: string;
}

export interface MatchDto {
  id: string;
  bookingId: string;
  hostId: string;
  hostName: string;
  title: string;
  skillLevel: string;
  maxPlayers: number;
  currentPlayers: number;
  feePerPlayer: number;
  status: string;
  createdAt: string;
  venueName: string;
  courtName: string;
  startTime: string;
  endTime: string;
  players: MatchPlayerDto[];
}

export const matchService = {
  getAllMatches: (status?: string) => {
    return axiosClient.get('/matches', { params: { status } }).then(res => (res as any).data as MatchDto[]);
  },
  
  getMatchDetail: (matchId: string) => {
    return axiosClient.get(`/matches/${matchId}`).then(res => (res as any).data as MatchDto);
  },
  
  createMatch: (data: { 
    bookingId: string; 
    title: string; 
    skillLevel: string; 
    maxPlayers: number; 
    feePerPlayer: number; 
  }) => {
    return axiosClient.post('/matches', data).then(res => (res as any).data as MatchDto);
  },
  
  joinMatch: (matchId: string) => {
    return axiosClient.post(`/matches/${matchId}/join`).then(res => (res as any).message as string);
  },
  
  approveJoinRequest: (matchId: string, userId: string) => {
    return axiosClient.put(`/matches/${matchId}/approve/${userId}`).then(res => (res as any).message as string);
  },
  
  rejectJoinRequest: (matchId: string, userId: string) => {
    return axiosClient.put(`/matches/${matchId}/reject/${userId}`).then(res => (res as any).message as string);
  },
  
  leaveMatch: (matchId: string) => {
    return axiosClient.post(`/matches/${matchId}/leave`).then(res => (res as any).message as string);
  },
  
  cancelMatch: (matchId: string) => {
    return axiosClient.delete(`/matches/${matchId}`).then(res => (res as any).message as string);
  },
  
  updateAttendance: (matchId: string, userId: string, status: string) => {
    return axiosClient.put(`/matches/${matchId}/attendance/${userId}`, null, { params: { status } }).then(res => (res as any).message as string);
  }
};
