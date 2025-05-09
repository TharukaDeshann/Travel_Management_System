import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserById } from '../services/userService';
import '../styles/ProfileView.css';
import { fetchLoggedInUser } from '../services/authService';

const ProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const fetchLoggedInUserData = async () => {
      try {
        const userData = await fetchLoggedInUser();
        setLoggedInUser(userData);
      } catch (err) {
        console.error('Failed to fetch logged-in user:', err);
        navigate('/login'); // Redirect to login if fetching fails
      }
    };
        
      fetchLoggedInUserData();
    }, [navigate]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  const handleChat = () => {
    location.href = `/inbox`;
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={handleGoBack}>
          Back
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">User not found</div>
        <button className="back-button" onClick={handleGoBack}>
          Back
        </button>
      </div>
    );
  }

  

  const isGuide = user.role === 'GUIDE';
  const isTraveler = user.role === 'TRAVELER';
  const isAdmin = user.role === 'ADMIN';

  // Check if the logged-in user is a guide and the viewed user is a traveler or vice versa
  const isTravelerViewingGuide = loggedInUser?.role === 'TRAVELER' && isGuide;
  const isGuideViewingTraveler = loggedInUser?.role === 'GUIDE' && isTraveler;



  // Check if the logged-in user is the same as the viewed user
  const isSameUser = loggedInUser && loggedInUser.id === user.id;

  if(isSameUser) {
    navigate(`/profile`);
  }

 

  return (
    <div className="profile-container">
      <button className="back-button" onClick={handleGoBack}>
        ← Back
      </button>
      
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profileImage ? (
            <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
          ) : (
            <div className="avatar-placeholder">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="profile-title">
          <h1>{user.firstName} {user.lastName}</h1>
          <div className="role-badge" data-role={user.role.toLowerCase()}>
            {user.role}
          </div>
          {user.online && <span className="online-status">●</span>}
        </div>
      </div>

      <div className="profile-content">
        

        
        
          <div className="profile-section">
          {isTraveler &&(<h2>Traveler Information</h2> || <h2>Guide Information</h2>)}
            
            
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value">{user.firstName} {user.lastName}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{user.role}</span>
            </div>
            
            {user.address && (
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{user.address}</span>
              </div>
            )}
            
            {user.joinedDate && (
              <div className="detail-item">
                <span className="detail-label">Member since:</span>
                <span className="detail-value">
                  {new Date(user.joinedDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
           {/* Traveler-specific Section */}
            {isTraveler && (<div className="detail-item">
                <span className="detail-label">Nationality:</span>
                <span className="detail-value">{user.nationality}</span>
              </div>)}
              
              {user.preferredDestinations && (
                <div className="detail-item">
                  <span className="detail-label">Preferred Destinations:</span>
                  <span className="detail-value">{user.preferredDestinations}</span>
                </div>
              )}
              
              {user.travelInterests && (
                <div className="detail-item">
                  <span className="detail-label">Travel Interests:</span>
                  <span className="detail-value">{user.travelInterests}</span>
                </div>
              )}
            </div>
          
        

        {/* Guide-specific Section */}
        {isGuide && (
          <div className="profile-section">
            
            <div className="profile-details">
              {user.expertiseCityRegion && (
                <div className="detail-item">
                  <span className="detail-label">Area of Expertise:</span>
                  <span className="detail-value">{user.expertiseCityRegion}</span>
                </div>
              )}
              
              {user.language && (
                <div className="detail-item">
                  <span className="detail-label">Languages:</span>
                  <span className="detail-value">{user.language}</span>
                </div>
              )}
              
              {user.contactNumber && (
                <div className="detail-item">
                  <span className="detail-label">Contact Number:</span>
                  <span className="detail-value">{user.contactNumber}</span>
                </div>
              )}
              
              {user.email && (
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
              )}
              
              {user.vehicleAvailability && (
                <div className="detail-item">
                  <span className="detail-label">Vehicle Available:</span>
                  <span className="detail-value highlight-badge">
                    {typeof user.vehicleAvailability === 'boolean' 
                      ? (user.vehicleAvailability ? 'Yes' : 'No')
                      : user.vehicleAvailability}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Section - For guides or any user with a about */}
        {(user.about || isGuide) && (
          <div className="profile-section">
            <h2>About</h2>
            <p className="user-about">{user.about || 'No about provided'}</p>
          </div>
        )}

        

        {/*Guide Reviews Section */}
        {isGuide && user.reviews && user.reviews.length > 0 && (
          <div className="profile-section">
            <h2>Reviews ({user.reviews.length})</h2>
            <div className="reviews-list">
              {user.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">{review.reviewerName}</span>
                    <span className="review-rating">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="profile-actions">
          {isGuideViewingTraveler && (
            <>
              <button className="primary-button" onClick={handleChat}>
                Chat
              </button>
              
            </>
          )}
          {isTravelerViewingGuide && (
            <button className="primary-button" onClick={handleChat}>Chat</button>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ProfileView;