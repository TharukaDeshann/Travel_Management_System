import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Star, MapPin, Languages, Phone, Mail, Car, Shield, Clock, Calendar, Edit, Trash2, AlertCircle } from 'lucide-react';
import apiClient from '../services/axiosInstance';
import { fetchLoggedInUser } from '../services/authService';
import ReviewModal from './ReviewModal';
import { useUser } from '../context/UserContext';

const GuideModal = ({
  guide,
  onClose,
  currentUser,
  prefillDate,
  prefillPlaces,
  itineraryId,
  dayIndex,
  travelerId,
  dayPlanId,
  onBookingComplete
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [reservationDetails, setReservationDetails] = useState(
    Array(1).fill().map(() => ({
      place: prefillPlaces ? prefillPlaces.join(", ") : '',
      date: prefillDate || '',
      travelers: 1,
      vehicleRequested: false,
      vehicleDetails: ''
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const loggedUser = currentUser || user;
  const [showAwaitConfirmation, setShowAwaitConfirmation] = useState(false);
  const [reservationResult, setReservationResult] = useState(null);

  // Fetch reviews when guide is selected
  useEffect(() => {
    fetchReviews();
  }, [guide.id]);

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const response = await apiClient.get(`/api/reviews/guide/${guide.id}`);
      setReviews(response.data || []);
      const ratingResponse = await apiClient.get(`/api/reviews/guide/${guide.id}/average-rating`);
      setAverageRating(ratingResponse.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchLoggedInUser();
        setLoggedInUser(user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setLoggedInUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
    // Pre-fill the form with itinerary data
    if (prefillDate && prefillPlaces && prefillPlaces.length > 0) {
      const updatedDetails = [...reservationDetails];
      updatedDetails[0] = {
        ...updatedDetails[0],
        place: prefillPlaces.join(", "),
        date: prefillDate
      };
      setReservationDetails(updatedDetails);
    }
  }, [prefillDate, prefillPlaces]);

  const handleDayChange = (e) => {
    const days = parseInt(e.target.value);
    setNumberOfDays(days);

    const newDetails = [];
    for (let i = 0; i < days; i++) {
      if (i === 0 && prefillDate && prefillPlaces) {
        newDetails.push({
          place: prefillPlaces.join(", "),
          date: prefillDate,
          travelers: reservationDetails[0]?.travelers || 1,
          vehicleRequested: reservationDetails[0]?.vehicleRequested || false,
          vehicleDetails: reservationDetails[0]?.vehicleDetails || ''
        });
      } else {
        newDetails.push(reservationDetails[i] || {
          place: '',
          date: '',
          travelers: 1,
          vehicleRequested: false,
          vehicleDetails: ''
        });
      }
    }
    setReservationDetails(newDetails);
  };

  const handleDetailChange = (index, field, value) => {
    if ((index === 0 && field === 'place' && prefillPlaces) || 
        (index === 0 && field === 'date' && prefillDate)) {
      return;
    }
    const updatedDetails = [...reservationDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value
    };
    setReservationDetails(updatedDetails);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      setIsSubmitting(true);
      
      await apiClient.post(`/api/reviews/guide/${guide.id}`, {
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      setReviewSuccess("Review submitted successfully!");
      await fetchReviews();
      setReviewToEdit(null);
      
      // Clear success message after a delay
      setTimeout(() => setReviewSuccess(null), 3000);
    } catch (err) {
      console.error("Review submission error:", err);
      setError(err.response?.data || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      setIsSubmitting(true);
      await apiClient.delete(`/api/reviews/${reviewId}`);
      setReviewSuccess("Review deleted successfully!");
      await fetchReviews();
      setConfirmDeleteId(null);
      
      // Clear success message after a delay
      setTimeout(() => setReviewSuccess(null), 3000);
    } catch (err) {
      console.error("Review deletion error:", err);
      setError(err.response?.data || "Failed to delete review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MODIFIED handleSubmit ---
  const handleSubmit = async () => {
    if (isLoadingUser) {
      setError('Please wait while we load your user data');
      return;
    }

    const userToUse = loggedInUser || currentUser;
    if (!userToUse || !userToUse.id) {
      setError('Please login to make a reservation');
      navigate('/login');
      return;
    }

    // Validate all fields are filled
    for (let i = 0; i < reservationDetails.length; i++) {
      const detail = reservationDetails[i];
      if (!detail.place || !detail.date || !detail.travelers) {
        setError(`Please fill all required fields for Day ${i + 1}`);
        return;
      }
    }

    // Validate dates are not in the past and sequential
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < reservationDetails.length; i++) {
      const detail = reservationDetails[i];
      const selectedDate = new Date(detail.date);

      if (selectedDate < today) {
        setError(`Date for Day ${i + 1} cannot be in the past`);
        return;
      }

      if (i > 0) {
        const previousDate = new Date(reservationDetails[i - 1].date);
        if (selectedDate <= previousDate) {
          setError(`Date for Day ${i + 1} must be after Day ${i}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reservationData = {
        travelerId: travelerId || userToUse.id,
        guideId: guide.id,
        dayDetails: reservationDetails.map((detail, index) => ({
          dayNumber: index + 1,
          places: detail.place,
          date: detail.date,
          numberOfTravelers: detail.travelers,
          vehicleRequested: detail.vehicleRequested,
          vehicleDetails: detail.vehicleDetails
        })),
        dayPlanId: dayPlanId // <-- INCLUDED HERE
      };

      // Create reservation
      const reservationResponse = await apiClient.post('/api/reservations', reservationData);
      const reservation = reservationResponse.data;
      setReservationResult(reservation);

      // Show "await confirmation" dialog
      setShowAwaitConfirmation(true);
    } catch (err) {
      console.error('Reservation failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for OK button in the confirmation dialog
  const handleAwaitConfirmationOk = async () => {
    if (reservationResult && dayPlanId) {
      // Find the correct day detail for this day
      const dayDetail = (reservationResult.dayDetails || []).find(
        d => d.date === prefillDate
      );
      if (dayDetail) {
        try {
          // The backend now handles linking the reservation to the day plan.
          // No need to call a separate service here.
        } catch (err) {
          // Optionally show error
        }
      }
    }
    setShowAwaitConfirmation(false);
    onClose && onClose();
    onBookingComplete && onBookingComplete();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={rating >= star ? '#FFD700' : 'none'}
            color={rating >= star ? '#FFD700' : '#ddd'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      {/* Modal Content */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header with Tabs */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {guide.firstName} {guide.lastName}
              {guide.verified && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  <Shield size={12} /> Verified
                </span>
              )}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'details' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('details');
                setReviewToEdit(null);
              }}
            >
              Guide Details
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'reviews' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('reviews');
                setReviewToEdit(null);
              }}
            >
              Reviews {averageRating && `(${averageRating.toFixed(1)})`}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'reservation' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveTab('reservation');
                setReviewToEdit(null);
              }}
            >
              Make Reservation
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                  <img 
                    src={guide.profileImageUrl || 'https://via.placeholder.com/300x400?text=Guide+Profile'}
                    alt={`${guide.firstName} ${guide.lastName}`}
                    className="w-full h-80 object-cover rounded-xl shadow-md"
                  />
                  
                  {averageRating !== null && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(averageRating)}
                        </div>
                        <span className="font-semibold text-gray-700">{averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-500">{reviews.length} reviews</span>
                    </div>
                  )}
                </div>
                
                <div className="lg:w-2/3 space-y-5">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={18} className="text-blue-500 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Expertise Region</p>
                          <p className="text-gray-800">{guide.expertiseCityRegion}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Languages size={18} className="text-green-500 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Languages</p>
                          <p className="text-gray-800">{guide.language}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Phone size={18} className="text-purple-500 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contact</p>
                          <p className="text-gray-800">{guide.contactNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-2">
                        <Mail size={18} className="text-red-500 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-gray-800">{guide.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Car size={18} className="text-orange-500 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Vehicle</p>
                          <p className="text-gray-800">{guide.vehicleAvailability ? 'Available' : 'Not Available'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Clock size={18} className="text-teal-500 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Experience</p>
                          <p className="text-gray-800">{guide.experience || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {guide.about || 'No information provided.'}
                    </p>
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                      See Reviews
                    </button>
                    <button
                      onClick={() => setActiveTab('reservation')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Make Reservation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 'reviews' && !reviewToEdit && (
            <div className="p-6">
              {/* Success message */}
              {reviewSuccess && (
                <div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-700 rounded-lg flex items-center gap-2">
                  <div className="shrink-0">✓</div>
                  <p>{reviewSuccess}</p>
                </div>
              )}
            
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Reviews
                  </h3>
                  {averageRating !== null && (
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                      <Star size={18} fill="#FFD700" color="#FFD700" />
                      <span className="font-semibold">{averageRating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({reviews.length})</span>
                    </div>
                  )}
                </div>
                
                {loggedUser && loggedUser.id !== guide.id && (
                  <button 
                    onClick={() => setReviewToEdit({ isNew: true, rating: 0, comment: '' })}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Write a Review
                  </button>
                )}
              </div>
              
              {isLoadingReviews ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No reviews yet.</p>
                  {loggedUser && loggedUser.id !== guide.id && (
                    <button 
                      onClick={() => setReviewToEdit({ isNew: true, rating: 0, comment: '' })}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Be the first to review
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                            {review.travelerName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{review.travelerName || 'Anonymous'}</h4>
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
                        <div className="mt-3 flex justify-end gap-2">
                          <button 
                            onClick={() => setReviewToEdit({
                              id: review.id,
                              rating: review.rating,
                              comment: review.comment
                            })}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(review.id)}
                            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                      
                      {/* Delete confirmation */}
                      {confirmDeleteId === review.id && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-red-700 text-sm mb-2">Are you sure you want to delete this review?</p>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReviewDelete(review.id)}
                              disabled={isSubmitting}
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
          
          {/* Review Form */}
          {activeTab === 'reviews' && reviewToEdit && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {reviewToEdit.id ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                <button 
                  onClick={() => setReviewToEdit(null)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewToEdit({...reviewToEdit, rating: star})}
                      className="focus:outline-none"
                    >
                      <Star 
                        size={32}
                        fill={reviewToEdit.rating >= star ? '#FFD700' : 'none'}
                        color={reviewToEdit.rating >= star ? '#FFD700' : '#D1D5DB'}
                        className="transition-colors duration-150"
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewToEdit.comment}
                  onChange={(e) => setReviewToEdit({...reviewToEdit, comment: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="5"
                  placeholder="Share your experience with this guide..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReviewToEdit(null)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewSubmit(reviewToEdit)}
                  disabled={isSubmitting || !reviewToEdit.rating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : reviewToEdit.id ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}
          
          {/* Reservation Tab */}
          {activeTab === 'reservation' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Create Reservation</h3>
              <p className="text-gray-600 mb-6">
                Booking guide: {guide.firstName} {guide.lastName} ({guide.expertiseCityRegion})
              </p>
              
              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">
                  Number of Days:
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={numberOfDays}
                    onChange={handleDayChange}
                    className="ml-3 px-3 py-2 w-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </label>
              </div>
              
              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                {reservationDetails.map((detail, index) => (
                  <div key={index} className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                      <Calendar size={18} className="mr-2 text-blue-600" />
                      Day {index + 1} Details
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Places to Visit:</label>
                        <input
                          type="text"
                          value={detail.place}
                          onChange={(e) => handleDetailChange(index, 'place', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter the places to visit"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Date:</label>
                        <input
                          type="date"
                          value={detail.date}
                          onChange={(e) => handleDetailChange(index, 'date', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Number of Travelers:</label>
                        <input
                          type="number"
                          min="1"
                          value={detail.travelers}
                          onChange={(e) => handleDetailChange(index, 'travelers', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      {guide.vehicleAvailability && (
                        <div className="mt-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={detail.vehicleRequested}
                              onChange={(e) => handleDetailChange(index, 'vehicleRequested', e.target.checked)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Request Vehicle for this day</span>
                          </label>
                          
                          {detail.vehicleRequested && (
                            <div className="mt-3">
                              <label className="block mb-2 text-sm font-medium text-gray-700">Vehicle Details:</label>
                              <textarea
                                value={detail.vehicleDetails}
                                onChange={(e) => handleDetailChange(index, 'vehicleDetails', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                placeholder="Any special requirements for the vehicle?"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-center">
                  {error}
                </div>
              )}
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAwaitConfirmation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1100]">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Await Guide Confirmation</h2>
            <p className="mb-6">Your reservation has been sent. Please wait for the guide to confirm.</p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              onClick={handleAwaitConfirmationOk}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideModal;