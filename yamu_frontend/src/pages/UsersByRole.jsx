// pages/UsersByRole.jsx
import React, { useState, useCallback } from 'react';
import { useUsersByRole } from '../hooks/useUsersByRole';
import UserList from '../components/UserList';
import '../styles/UsersByRole.css';

const UsersByRole = () => {
  // Define available roles with friendly names
  const roleOptions = [
    { value: 'GUIDE', label: 'Tour Guide' },
    { value: 'TRAVELER', label: 'Traveler' }
  ];

  // State for filters and sorting
  const [filters, setFilters] = useState({
    role: '',
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState('name-asc');

  // Fetch users based on selected role
  const { users, loading, error, refetch } = useUsersByRole(filters.role);

  // Filter and sort users
  const filteredAndSortedUsers = React.useMemo(() => {
    if (!users.length) return [];
    
    // First apply search filter if any
    let result = users;
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.expertiseCityRegion && user.expertiseCityRegion.toLowerCase().includes(searchLower)) ||
        (user.nationality && user.nationality.toLowerCase().includes(searchLower))
      );
    }
    
    // Then sort the results
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'name-desc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        default:
          return 0;
      }
    });
  }, [users, filters.searchTerm, sortBy]);

  // Handle filter changes
  const handleRoleChange = (e) => {
    setFilters(prev => ({ ...prev, role: e.target.value }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleResetFilters = () => {
    setFilters({
      role: '',
      searchTerm: ''
    });
    setSortBy('name-asc');
  };

  // Handle user actions
  const handleViewProfile = useCallback((userId) => {
    // Implementation for viewing user profile
    console.log(`View profile for user: ${userId}`);
    // Navigate to user profile page
    // history.push(`/users/${userId}`);
  }, []);

  const handleContactUser = useCallback((userId) => {
    // Implementation for contacting user
    console.log(`Contact user: ${userId}`);
    // Open contact modal or navigate to messaging page
  }, []);

  return (
    <div className="users-by-role">
      <div className="users-by-role__header">
        <h1 className="users-by-role__title">User Directory</h1>
        <p className="users-by-role__subtitle">Find and connect with guides and travelers</p>
      </div>

      <div className="filter-panel">
        <form className="filter-panel__form" onSubmit={(e) => e.preventDefault()}>
          <div className="filter-panel__group">
            <label htmlFor="role-select" className="filter-panel__label">User Role</label>
            <select
              id="role-select"
              className="filter-panel__select"
              value={filters.role}
              onChange={handleRoleChange}
            >
              <option value="">All Roles</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-panel__group">
            <label htmlFor="search-input" className="filter-panel__label">Search</label>
            <input
              id="search-input"
              type="text"
              className="filter-panel__select" // Reusing styles for consistency
              placeholder="Search by name, email..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filter-panel__group">
            <button 
              type="button" 
              className="filter-panel__button filter-panel__button--reset"
              onClick={handleResetFilters}
            >
              Reset
            </button>
            <button 
              type="button" 
              className="filter-panel__button"
              onClick={refetch}
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="users-results">
        {!loading && !error && (
          <div className="users-results__header">
            <div className="users-results__count">
              Showing {filteredAndSortedUsers.length} {filters.role ? filters.role.toLowerCase() + 's' : 'users'}
            </div>
            <div className="users-results__sort">
              <span className="users-results__sort-label">Sort by:</span>
              <select 
                className="users-results__sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-indicator">
            <div className="loading-indicator__spinner"></div>
            <span>Loading users...</span>
          </div>
        ) : (
          <UserList 
            users={filteredAndSortedUsers} 
            onViewProfile={handleViewProfile}
            onContactUser={handleContactUser}
          />
        )}
      </div>
    </div>
  );
};

export default UsersByRole;