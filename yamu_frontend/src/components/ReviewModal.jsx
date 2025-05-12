import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import apiClient from '../services/axiosInstance';

const ReviewModal = ({ guide, currentUser, onClose, onReviewSubmitted }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserReview = async () => {
      try {
        if (currentUser?.id) {
          const response = await apiClient.get(`/api/reviews/guide/${guide.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          const userReview = response.data.find(r => r.traveler.id === currentUser.id);
          if (userReview) {
            setExistingReview(userReview);
            setReviewText(userReview.comment);
            setRating(userReview.rating);
          }
        }
      } catch (err) {
        console.error('Error fetching user review:', err);
        setError('Failed to load review data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserReview();
  }, [guide.id, currentUser]);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    try {
      await apiClient.post(`/api/reviews/guide/${guide.id}`, {
        rating,
        comment: reviewText
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
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
        maxWidth: '90%'
      }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: '20px',
          color: '#532321'
        }}>
          {existingReview ? 'Update Your Review' : 'Leave a Review'}
        </h2>
        
        <p style={{ marginBottom: '5px' }}>Guide: {guide.firstName} {guide.lastName}</p>
        
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
      </div>
    </div>
  );
};

export default ReviewModal;