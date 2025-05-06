// pages/UsersSocialPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useUsersByRole } from '../hooks/useUsersByRole';
import UserSocialList from '../components/UserSocialList';
import '../styles/UserSocialList.css';

const UsersSocialPage = () => {
  // State for filters
  const [activeRole, setActiveRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Fetch users based on selected role
  const { users, loading, error } = useUsersByRole(activeRole);

  // Filter users based on search term
  useEffect(() => {
    if (!users) return;
    
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      (user.expertiseCityRegion && user.expertiseCityRegion.toLowerCase().includes(searchLower)) ||
      (user.nationality && user.nationality.toLowerCase().includes(searchLower)) ||
      (user.language && user.language.toLowerCase().includes(searchLower)) ||
      (user.address && user.address.toLowerCase().includes(searchLower))
    );
    
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  // Handle role filter change
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setSearchTerm('');
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle view profile action
  const handleViewProfile = useCallback((userId) => {
    // Implementation for viewing user profile
    console.log(`View profile for user: ${userId}`);
    // Navigate to user profile page
    // history.push(`/users/${userId}`);
  }, []);

  return (
    <div className="user-list-container">
      <h1>Find Users</h1>
      
      <div className="search-panel">
        <div className="search-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="role-filter">
          <button 
            className={`role-tab ${activeRole === '' ? 'active' : ''}`}
            onClick={() => handleRoleChange('')}
          >
            All Users
          </button>
          <button 
            className={`role-tab ${activeRole === 'GUIDE' ? 'active' : ''}`}
            onClick={() => handleRoleChange('GUIDE')}
          >
            Tour Guides
          </button>
          <button 
            className={`role-tab ${activeRole === 'TRAVELER' ? 'active' : ''}`}
            onClick={() => handleRoleChange('TRAVELER')}
          >
            Travelers
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <UserSocialList 
        users={filteredUsers} 
        loading={loading}
        onViewProfile={handleViewProfile}
      />
    </div>
  );
};

export default UsersSocialPage;