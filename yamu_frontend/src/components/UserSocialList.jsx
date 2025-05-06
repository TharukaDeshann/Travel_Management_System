// components/UserSocialList.jsx
import React from 'react';
import PropTypes from 'prop-types';
import UserItem from './UserItem';
import '../styles/UserSocialList.css';

const UserSocialList = ({ users, loading, onViewProfile }) => {
  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (!users || users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👥</div>
        <h3>No users found</h3>
        <p className="empty-state-text">Try changing your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      {users.map((user) => (
        <UserItem 
          key={user.id} 
          user={user} 
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};

UserSocialList.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onViewProfile: PropTypes.func.isRequired
};

UserSocialList.defaultProps = {
  loading: false
};

export default UserSocialList;