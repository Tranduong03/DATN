import { Star } from 'lucide-react';
import './ReviewsTab.css';

interface ReviewsTabProps {
  venue?: any; // For owner view: contains averageRating, reviewCount
  reviews?: any[]; // For user view: list of review objects
  isOwner: boolean;
}

export default function ReviewsTab({
  venue,
  reviews = [],
  isOwner,
}: ReviewsTabProps) {
  if (isOwner) {
    const avgRating = venue?.averageRating || 5.0;
    const reviewCount = venue?.reviewCount || 0;

    return (
      <div className="owner-venue-reviews-tab">
        <div className="owner-venue-rating-box">
          <div className="owner-venue-rating-val">{avgRating}</div>
          <div className="owner-venue-rating-info">
            <div className="owner-venue-rating-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= Math.round(avgRating) ? '#f5d061' : 'none'}
                  color="#f5d061"
                />
              ))}
            </div>
            <div className="owner-venue-rating-count">
              Dựa trên {reviewCount} lượt đánh giá
            </div>
          </div>
        </div>
        <p className="owner-venue-reviews-placeholder">
          Chưa có bình luận chi tiết từ khách hàng.
        </p>
      </div>
    );
  }

  // User view
  return (
    <div className="user-venue-reviews-tab">
      {reviews && reviews.length > 0 ? (
        reviews.map((review: any) => (
          <div key={review.id} className="sheet-review-item">
            <div className="sheet-review-header">
              <div className="sheet-review-user">
                {review.userAvatar ? (
                  <img src={review.userAvatar} alt={review.userName} className="sheet-review-avatar" />
                ) : (
                  <div className="sheet-review-avatar-placeholder">
                    {review.userName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="sheet-review-username">{review.userName}</span>
              </div>
              <div className="sheet-review-rating">
                <Star size={10} fill="#d97706" color="#d97706" />
                <span>{review.rating}</span>
              </div>
            </div>
            {review.comment && <p className="sheet-review-comment">{review.comment}</p>}
          </div>
        ))
      ) : (
        <span className="sheet-tab-text">Chưa có đánh giá nào.</span>
      )}
    </div>
  );
}
export type { ReviewsTabProps };
