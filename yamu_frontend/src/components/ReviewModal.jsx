import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import apiClient from '../services/axiosInstance';
import { fetchLoggedInUser } from '../services/authService'; // Import fetchLoggedInUser

const ReviewModal = ({ guide, onClose, onReviewSubmitted }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // State for logged-in user

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await fetchLoggedInUser(); // Fetch logged-in user
        setCurrentUser(user);
      } catch (err) {
        console.error('Error fetching logged-in user:', err);
        setError('Failed to fetch user data. Please log in again.');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserReview = async () => {
      if (!currentUser?.id) return;

      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const response = await apiClient.get(`/api/reviews/guide/${guide.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const userReview = response.data.find(r => r.travelerId === currentUser.id);
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

    if (currentUser) {
      fetchUserReview();
    }
  }, [guide.id, currentUser]);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!currentUser?.id || !token) {
      setError('User information not available. Please login again.');
      return;
    }

    try {
      await apiClient.post(
        `/api/reviews/guide/${guide.id}`, 
        {
          rating,
          comment: reviewText
        }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
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