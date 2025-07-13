import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/axiosInstance';
import { fetchLoggedInUser } from '../services/authService';
import ReviewModal from './ReviewModal';
import { Star } from 'lucide-react';

const GuideModal = ({ guide, onClose, currentUser, prefillDate, prefillPlaces }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
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

  // UPDATED HANDLE SUBMIT FUNCTION
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
        travelerId: userToUse.id,
        guideId: guide.id,
        dayDetails: reservationDetails.map((detail, index) => ({
          dayNumber: index + 1,
          places: detail.place,
          date: detail.date,
          numberOfTravelers: detail.travelers,
          vehicleRequested: detail.vehicleRequested,
          vehicleDetails: detail.vehicleDetails
        }))
      };

      const response = await apiClient.post('/api/reservations', reservationData);

      // CRITICAL UPDATE: Handle itinerary flow
      if (location.state?.fromItinerary) {
        // Navigate back to map with reservation result
        navigate('/map', {
          state: {
            guideReservationResult: {
              dayIndex: location.state.dayIndex,
              reservation: response.data
            },
            // Pass back all original state
            itineraryId: location.state.itineraryId,
            dates: location.state.dates,
            tripTitle: location.state.tripTitle,
            budget: location.state.budget,
            currency: location.state.currency,
            travelerId: location.state.travelerId
          }
        });
      } else {
        // Normal flow
        onClose();
        alert('Reservation request sent successfully!');
      }
    } catch (err) {
      console.error('Reservation failed:', err);
      setError(err.response?.data?.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component remains the same ...
  // (renderGuideDetails and renderReservationForm functions)

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
      zIndex: 1000
    }}>
      {/* ... modal content ... */}
    </div>
  );
};

export default GuideModal;