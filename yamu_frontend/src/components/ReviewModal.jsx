import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import apiClient from '../services/axiosInstance';
import { useUser } from '../context/UserContext';

const ReviewModal = ({ guide, onClose, onReviewSubmitted }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guideReviews, setGuideReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  
  const { user } = useUser();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch all reviews for this guide
        const reviewsResponse = await apiClient.get(`/api/reviews/guide/${guide.id}`);
        setGuideReviews(reviewsResponse.data);
        
        // Fetch average rating
        const avgRatingResponse = await apiClient.get(`/api/reviews/guide/${guide.id}/average-rating`);
        setAverageRating(avgRatingResponse.data || 0);
        
        // Check if current user has already reviewed this guide
        if (user?.id) {
          const userReview = reviewsResponse.data.find(r => r.travelerId === user.id);
          if (userReview) {
            setExistingReview(userReview);
            setReviewText(userReview.comment);
            setRating(userReview.rating);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [guide.id, user]);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    
    if (!user?.id) {
      setError('User information not available. Please login again.');
      return;
    }

    try {
      await apiClient.post(
        `/api/reviews/guide/${guide.id}`, 
        { rating, comment: reviewText }
      );
      onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          width: '500px',
          maxWidth: '90%',
          textAlign: 'center'
        }}>
          <p>Loading review data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        width: '500px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#532321' }}>
          Reviews for {guide.firstName} {guide.lastName}
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', marginRight: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  size={20}
                  fill={averageRating >= star ? '#FFD700' : 'none'}
                  color={averageRating >= star ? '#FFD700' : '#ddd'}
                />
              ))}
            </div>
            <span style={{ fontWeight: '500' }}>
              {averageRating.toFixed(1)} ({guideReviews.length} reviews)
            </span>
          </div>
          
          {guideReviews.length > 0 ? (
            <div style={{ 
              borderTop: '1px solid #eee',
              paddingTop: '15px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {guideReviews.map((review) => (
                <div key={review.id} style={{ 
                  marginBottom: '20px',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #f5f5f5'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>{review.travelerName}</strong>
                    <div style={{ display: 'flex' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          size={16}
                          fill={review.rating >= star ? '#FFD700' : 'none'}
                          color={review.rating >= star ? '#FFD700' : '#ddd'}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: '5px 0', color: '#555' }}>{review.comment}</p>
                  <small style={{ color: '#999' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', margin: '20px 0' }}>
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
        
        {user && (
          <>
            <h3 style={{ marginBottom: '15px' }}>
              {existingReview ? 'Update Your Review' : 'Write a Review'}
            </h3>
            
            <div style={{ margin: '20px 0' }}>
              <p style={{ marginBottom: '10px', fontWeight: '500' }}>Your Rating:</p>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    size={28}
                    fill={(hoverRating || rating) >= star ? '#FFD700' : 'none'}
                    color={(hoverRating || rating) >= star ? '#FFD700' : '#ddd'}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Your Review:
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this guide..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            {error && (
              <div style={{
                color: 'red',
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px'
              }}>
                {error}
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f0f0f0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!rating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#532321',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  opacity: !rating ? 0.7 : 1
                }}
              >
                {existingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </>
        )}
        
        {!user && (
          <div style={{ 
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginTop: '20px'
          }}>
            <p>Please log in to leave a review</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;