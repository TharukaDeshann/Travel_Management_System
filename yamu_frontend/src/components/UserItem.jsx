// components/UserItem.jsx
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/UserSocialList.css';

const UserItem = ({ user, onViewProfile }) => {
  // Get user initials for avatar
  const getInitials = () => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;
  };

  // Format role for display
  const formatRole = (role) => {
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  // Render appropriate details based on user role
  const renderUserDetails = () => {
    if (user.role === 'GUIDE') {
      return (
        <>
          <div className="user-meta">
            <span className="user-meta-item">
              <p className="user-meta-icon">🌍</p> Expertise: {user.expertiseCityRegion}
            </span>
            <span className="user-meta-item">
              <p className="user-meta-icon">🗣️</p> {user.language}
            </span>
            {user.vehicleAvailability && (
              <span className="user-meta-item">
                <p className="user-meta-icon">🚗</p> Vehicle available
              </span>
            )}
          </div>
          {user.about && <p className="user-details">{user.about}</p>}
        </>
      );
    } else if (user.role === 'TRAVELER') {
      return (
        <div className="user-meta">
          <span className="user-meta-item">
            <p className="user-meta-icon">🌍</p> Nationality: {user.nationality}
          </span>
          {user.address && (
            <span className="user-meta-item">
              <p className="user-meta-icon">📍</p> {user.address}
            </span>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="user-item">
      <avatar className="user-avatar">
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
        ) : (
          <div className="avatar-placeholder">
            {getInitials()}
          </div>
        )}
      </avatar>
      
      
      <div className="user-info">
        <h3 className="user-name">
          {user.firstName} {user.lastName}
          <span className={`user-role-badge user-role-badge--${user.role.toLowerCase()}`}>
            {formatRole(user.role)}
          </span>
        </h3>
        
        {renderUserDetails()}
      </div>
      
      <button 
        className="view-profile-btn"
        onClick={() => onViewProfile(user.id)}
      >
        View Profile
      </button>
    </div>
  );
};

UserItem.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    expertiseCityRegion: PropTypes.string,
    language: PropTypes.string,
    about: PropTypes.string,
    vehicleAvailability: PropTypes.bool,
    nationality: PropTypes.string,
    address: PropTypes.string
  }).isRequired,
  onViewProfile: PropTypes.func.isRequired
};

export default UserItem;