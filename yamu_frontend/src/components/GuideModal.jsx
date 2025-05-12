import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/axiosInstance';
import { fetchLoggedInUser } from '../services/authService';
import { refreshToken } from "../services/authService";

const GuideModal = ({ guide, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [reservationDetails, setReservationDetails] = useState(
    Array(1).fill().map(() => ({
      place: '',
      date: '',
      travelers: 1,
      vehicleRequested: false,
      vehicleDetails: ''
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchLoggedInUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  const handleDayChange = (e) => {
    const days = parseInt(e.target.value);
    setNumberOfDays(days);
    
    const newDetails = [];
    for (let i = 0; i < days; i++) {
      newDetails.push(reservationDetails[i] || { 
        place: '', 
        date: '', 
        travelers: 1,
        vehicleRequested: false,
        vehicleDetails: ''
      });
    }
    setReservationDetails(newDetails);
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...reservationDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value
    };
    setReservationDetails(updatedDetails);
  };

  const handleSubmit = async () => {
    if (isLoadingUser) {
      setError('Please wait while we load your user data');
      return;
    }

    if (!currentUser || !currentUser.id) {
      setError('Please login to make a reservation');
      navigate('/login');
      return;
    }

    for (let i = 0; i < reservationDetails.length; i++) {
      const detail = reservationDetails[i];
      if (!detail.place || !detail.date || !detail.travelers) {
        setError(`Please fill all required fields for Day ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reservationData = {
        travelerId: currentUser.id,
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
      console.log('Reservation Data:', reservationData);

      const response = await apiClient.post('/api/reservations', reservationData);
      
      if (response.status === 200) {
        onClose();
        alert('Reservation request sent successfully!');
        navigate('/traveler-dashboard');
      }
    } catch (err) {
      console.error('Reservation failed:', err);
      setError(err.response?.data?.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGuideDetails = () => (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <img 
          src={guide.profileImageUrl || '/src/images/default-profile.png'} 
          alt={guide.name}
          style={{
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      </div>

      <div style={{ flex: 2 }}>
        <h2 style={{ marginTop: 0 }}>{guide.firstName} {guide.lastName}</h2>
        <p><strong>Contact:</strong> {guide.contactNumber}</p>
        <p><strong>Email:</strong> {guide.email}</p>
        <p><strong>Address:</strong> {guide.address}</p>
        <p><strong>Expertise:</strong> {guide.expertiseCityRegion}</p>
        <p><strong>Language:</strong> {guide.language}</p>
        <p><strong>Vehicle:</strong> {guide.vehicleAvailability ? 'Available' : 'Not Available'}</p>
        <p><strong>About:</strong> {guide.about}</p>
        <p><strong>Verified:</strong> {guide.verified ? "Yes" : "No"}</p>

        
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '20px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => navigate(`/inbox?select=${guide.id}`)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Mail size={16} />
            Message
          </button>
          
          {currentUser && (
            <button
              onClick={() => setShowReviewModal(true)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Leave Review
            </button>
          )}
          
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#532321',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Make Reservation
          </button>
        </div>
      </div>
    </div>
  );

  const renderReservationForm = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginTop: 0, color: '#532321' }}>Create Reservation</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Booking guide: {guide.firstName} {guide.lastName} ({guide.expertiseCityRegion})
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Number of Days:</strong>
          <input
            type="number"
            min="1"
            max="30"
            value={numberOfDays}
            onChange={handleDayChange}
            style={{
              marginLeft: '10px',
              padding: '5px',
              width: '60px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
        </label>

        {reservationDetails.map((detail, index) => (
          <div key={index} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9'
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#532321' }}>
              Day {index + 1} Details
            </h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Places to Visit:
              </label>
              <input
                type="text"
                value={detail.place}
                onChange={(e) => handleDetailChange(index, 'place', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
                placeholder="Enter the places to visit"
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Date:
              </label>
              <input
                type="date"
                value={detail.date}
                onChange={(e) => handleDetailChange(index, 'date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Number of Travelers:
              </label>
              <input
                type="number"
                min="1"
                value={detail.travelers}
                onChange={(e) => handleDetailChange(index, 'travelers', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            {guide.vehicleAvailability && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={detail.vehicleRequested}
                    onChange={(e) => handleDetailChange(index, 'vehicleRequested', e.target.checked)}
                    style={{
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontWeight: '500' }}>Request Vehicle for this day</span>
                </label>

                {detail.vehicleRequested && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Vehicle Details:
                    </label>
                    <textarea
                      value={detail.vehicleDetails}
                      onChange={(e) => handleDetailChange(index, 'vehicleDetails', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        minHeight: '80px',
                        fontSize: '14px'
                      }}
                      placeholder="Any special requirements for the vehicle?"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          color: 'red',
          margin: '15px 0',
          padding: '10px',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '15px',
        marginTop: '20px'
      }}>
        <button
          onClick={() => setCurrentStep(1)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Back
        </button>
        <div style={{ display: 'flex', gap: '15px' }}>
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
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#532321',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Reservation'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
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
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '20px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ❌
          </button>

          {isLoadingUser ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}>
              <p>Loading guide information...</p>
            </div>
          ) : (
            currentStep === 1 ? renderGuideDetails() : renderReservationForm()
          )}
        </div>
      </div>
      
      {showReviewModal && (
        <ReviewModal
          guide={guide}
          currentUser={currentUser}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => {
            // Refresh ratings after submission
            apiClient.get(`/api/reviews/guide/${guide.id}/average-rating`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            })
              .then(res => setAverageRating(res.data || 0));
            apiClient.get(`/api/reviews/guide/${guide.id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            })
              .then(res => setReviewCount(res.data.length));
          }}
        />
      )}
    </>
  );
};

export default GuideModal;