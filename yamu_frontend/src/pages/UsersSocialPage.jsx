import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useUsersByRole } from "../hooks/useUsersByRole";
import UserSocialList from "../components/UserSocialList";
import "../styles/UserSocialList.css";
import UserDetailsModal from "../components/UserDetailsModal";
import { Layout } from "../components/Layout";
import { useUser } from "../context/UserContext";

const UsersSocialPage = () => {
  // State for filters
  const [activeRole, setActiveRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const loggedUser = useUser().user;
  const unreadCount = loggedUser?.unreadCount || 0;
  const [selectedCurrency, setSelectedCurrency] = useState("LKR");

  // Add useNavigate hook
  const navigate = useNavigate();

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
    const filtered = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        (user.expertiseCityRegion &&
          user.expertiseCityRegion.toLowerCase().includes(searchLower)) ||
        (user.nationality &&
          user.nationality.toLowerCase().includes(searchLower)) ||
        (user.language && user.language.toLowerCase().includes(searchLower)) ||
        (user.address && user.address.toLowerCase().includes(searchLower))
    );

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  // Handle role filter change
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setSearchTerm("");
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fixed handleViewProfile function
  const handleViewProfile = (userId) => {
    setSelectedUserId(userId);
    setShowUserDetailsModal(true);
  };

  return (
    <Layout
      user={loggedUser || {}}
      unreadCount={unreadCount || 0}
      onCurrencyChange={setSelectedCurrency}
    >
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
              className={`role-tab ${activeRole === "GUIDE" ? "active" : ""}`}
              onClick={() => handleRoleChange("GUIDE")}
            >
              Tour Guides
            </button>
            <button
              className={`role-tab ${
                activeRole === "TRAVELER" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("TRAVELER")}
            >
              Travelers
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <UserSocialList
          users={filteredUsers}
          loading={loading}
          onViewProfile={handleViewProfile}
        />

        {/* User Details Modal*/}
        <UserDetailsModal
          isOpen={showUserDetailsModal}
          onClose={() => setShowUserDetailsModal(false)}
          userId={selectedUserId}
        />
      </div>
    </Layout>
  );
};

export default UsersSocialPage;
