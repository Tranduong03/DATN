import axiosClient from '../api/axiosClient';

export interface ReviewDto {
  id: string;
  venueId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  comment?: string;
}

export const reviewService = {
  getVenueReviews: async (venueId: string): Promise<ReviewDto[]> => {
    const res = await axiosClient.get(`/reviews/venue/${venueId}`);
    return (res as any).data;
  },
  
  createReview: async (data: CreateReviewDto): Promise<ReviewDto> => {
    const res = await axiosClient.post('/reviews', data);
    return (res as any).data;
  }
};
