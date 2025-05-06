// components/UserList.jsx
import React from 'react';
import PropTypes from 'prop-types';
import UserCard from './UserCard';
import '../styles/UserList.css';

const UserList = ({ users, onViewProfile, onContactUser }) => {
  // Handle empty state
  if (users.length === 0) {
    return (
      <div className="user-list__empty">
        <div className="user-list__empty-icon">👤</div>
        <p className="user-list__empty-message">No users found</p>
        <p className="user-list__empty-suggestion">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onViewProfile={onViewProfile}
          onContactUser={onContactUser}
        />
      ))}
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      contactNumber: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    })
  ).isRequired,
  onViewProfile: PropTypes.func.isRequired,
  onContactUser: PropTypes.func.isRequired
};

export default UserList;