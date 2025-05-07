// components/UserCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/UserCard.css';

const UserCard = ({ user, onViewProfile, onContactUser }) => {
  // Get user initials for avatar
  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Format role display name
  const formatRole = (role) => {
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  return (
    <div className="user-card">
      <div className="user-card__header">
        <div className="user-card__avatar">{getInitials()}</div>
        <h3 className="user-card__name">{user.firstName} {user.lastName}</h3>
        <span className={`user-card__role user-card__role--${user.role.toLowerCase()}`}>
          {formatRole(user.role)}
        </span>
      </div>
      
      <div className="user-card__info">
        <div className="user-card__info-item">
          <span className="user-card__info-label">Email</span>
          <span className="user-card__info-value">{user.email}</span>
        </div>
        
        <div className="user-card__info-item">
          <span className="user-card__info-label">Contact</span>
          <span className="user-card__info-value">{user.contactNumber}</span>
        </div>
        
        {user.role === 'GUIDE' && (
          <>
            <div className="user-card__info-item">
              <span className="user-card__info-label">Expertise</span>
              <span className="user-card__info-value">{user.expertiseCityRegion}</span>
            </div>
            
            <div className="user-card__info-item">
              <span className="user-card__info-label">Language</span>
              <span className="user-card__info-value">{user.language}</span>
            </div>
          </>
        )}
        
        {user.role === 'TRAVELER' && (
          <div className="user-card__info-item">
            <span className="user-card__info-label">Nationality</span>
            <span className="user-card__info-value">{user.nationality}</span>
          </div>
        )}
      </div>
      
      <div className="user-card__footer">
        <button 
          className="user-card__button"
          onClick={() => onContactUser(user.id)}
        >
          Contact
        </button>
        <button 
          className="user-card__button user-card__button--primary"
          onClick={() => onViewProfile(user.id)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    contactNumber: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    expertiseCityRegion: PropTypes.string,
    language: PropTypes.string,
    nationality: PropTypes.string
  }).isRequired,
  onViewProfile: PropTypes.func.isRequired,
  onContactUser: PropTypes.func.isRequired
};

export default UserCard;