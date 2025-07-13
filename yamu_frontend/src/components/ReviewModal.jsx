import React, { useState, useEffect } from 'react';
import { Star, X, Trash2, Edit, AlertCircle } from 'lucide-react';
import apiClient from '../services/axiosInstance';
import { useUser } from '../context/UserContext';

const ReviewModal = ({ guide, onClose, onReviewSubmitted, currentUser, isDrawer = false }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [viewMode, setViewMode] = useState('write'); // 'write', 'list', 'manage'
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Use passed currentUser prop or context
  const { user } = useUser();
  const loggedUser = currentUser || user;

  useEffect(() => {
    fetchData();
  }, [guide.id, loggedUser]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all reviews for this guide
      const reviewsResponse = await apiClient.get(`/api/reviews/guide/${guide.id}`);
      const reviews = reviewsResponse.data || [];
      setAllReviews(reviews);
      
      // Check if current user has a review
      if (loggedUser?.id) {
        const myReview = reviews.find(r => r.travelerId === loggedUser.id);
        if (myReview) {
          setExistingReview(myReview);
          setReviewText(myReview.comment);
          setRating(myReview.rating);
        }
        
        // Get all reviews written by current user (if drawer mode)
        if (isDrawer) {
          try {
            const userReviewsResponse = await apiClient.get(`/api/reviews/traveler/${loggedUser.id}`);
            setUserReviews(userReviewsResponse.data || []);
          } catch (err) {
            console.error("Error fetching user reviews:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!loggedUser) {
      setError("Please log in to submit a review");
      return;
    }
    
    if (!rating) {
      setError("Please select a rating");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      await apiClient.post(`/api/reviews/guide/${guide.id}`, {
        rating,
        comment: reviewText
      });
      
      setSuccess(existingReview ? "Review updated successfully!" : "Review submitted successfully!");
      
      // Refresh data
      await fetchData();
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // If standalone modal, close it after submission
      if (!isDrawer) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setError(err.response?.data || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      await apiClient.delete(`/api/reviews/${reviewId}`);
      
      setSuccess("Review deleted successfully!");
      setConfirmDelete(null);
      
      // Reset form if it was the user's review for this guide
      if (existingReview && existingReview.id === reviewId) {
        setExistingReview(null);
        setReviewText('');
        setRating(0);
      }
      
      // Refresh data
      await fetchData();
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error("Review deletion error:", err);
      setError(err.response?.data || "Failed to delete review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setExistingReview(review);
    setReviewText(review.comment);
    setRating(review.rating);
    setViewMode('write');
  };

  const resetForm = () => {
    if (existingReview) {
      setReviewText(existingReview.comment);
      setRating(existingReview.rating);
    } else {
      setReviewText('');
      setRating(0);
    }
    setError(null);
    setSuccess(null);
  };

  const renderStars = (value, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {interactive ? (
              <button
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star 
                  size={interactive ? 32 : 16}
                  fill={(hoverRating || rating) >= star ? '#FFD700' : 'none'}
                  color={(hoverRating || rating) >= star ? '#FFD700' : '#D1D5DB'}
                  className="transition-colors duration-150"
                />
              </button>
            ) : (
              <Star 
                size={16}
                fill={value >= star ? '#FFD700' : 'none'}
                color={value >= star ? '#FFD700' : '#D1D5DB'}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={isDrawer ? 'p-6' : 'fixed inset-0 bg-black/60 flex items-center justify-center z-50'}>
        <div className={isDrawer ? '' : 'bg-white rounded-xl p-6 w-full max-w-md shadow-xl'}>
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // For embedding in another component (drawer)
  if (isDrawer) {
    return (
      <div className="p-6">
        {/* Tabs for drawer mode */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              viewMode === 'write' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setViewMode('write')}
          >
            {existingReview ? 'Edit Review' : 'Write Review'}
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              viewMode === 'list' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setViewMode('list')}
          >
            All Reviews ({allReviews.length})
          </button>
          {loggedUser && (
            <button
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                viewMode === 'manage' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setViewMode('manage')}
            >
              Manage My Reviews
            </button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <div className="shrink-0">✓</div>
            <p>{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Write/Edit Review View */}
        {viewMode === 'write' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {existingReview ? 'Update Your Review' : 'Write a Review'}
            </h3>
            
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
              <div className="flex gap-2">
                {renderStars(rating, true)}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="5"
                placeholder="Share your experience with this guide..."
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
        
        {/* All Reviews List View */}
        {viewMode === 'list' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              All Reviews for {guide.firstName} {guide.lastName}
            </h3>
            
            {allReviews.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No reviews yet for this guide.</p>
                <button 
                  onClick={() => setViewMode('write')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Be the first to leave a review
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {allReviews.map(review => (
                  <div key={review.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div className="flex gap-2 items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                          {review.travelerName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{review.travelerName || 'Anonymous User'}</h4>
                          <div className="flex text-yellow-400">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-700">{review.comment}</p>
                    
                    {loggedUser && loggedUser.id === review.travelerId && (
                      <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(review)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(review.id)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                    
                    {confirmDelete === review.id && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-red-700 text-sm mb-2">Are you sure you want to delete this review?</p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Manage My Reviews View */}
        {viewMode === 'manage' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Manage Your Reviews
            </h3>
            
            {!loggedUser ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">Please log in to manage your reviews.</p>
              </div>
            ) : userReviews.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">You haven't written any reviews yet.</p>
                <button 
                  onClick={() => setViewMode('write')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Write your first review
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {userReviews.map(review => (
                  <div key={review.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Review for: {review.guideName || 'Guide'}</h4>
                        <div className="flex text-yellow-400 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-700">{review.comment}</p>
                    
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(review)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(review.id)}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                    
                    {confirmDelete === review.id && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-red-700 text-sm mb-2">Are you sure you want to delete this review?</p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Standalone modal
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-md shadow-xl m-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            {existingReview ? 'Update Your Review' : 'Write a Review for ' + guide.firstName}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mx-5 mt-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <div className="shrink-0">✓</div>
            <p>{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="p-5">
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
            <div className="flex gap-2 justify-center">
              {renderStars(rating, true)}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="5"
              placeholder="Share your experience with this guide..."
            />
          </div>
        </div>
        
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="flex gap-2">
            {existingReview && (
              <button
                onClick={() => setConfirmDelete(existingReview.id)}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
        
        {/* Delete Confirmation */}
        {confirmDelete && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center p-6">
            <div className="max-w-sm bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Confirm Deletion</h4>
              <p className="text-gray-600 mb-5">Are you sure you want to delete this review? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;