import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTravelers,
  deleteTraveler,
  getTravelerGuideReservations,
  getTravelerHotelBookings,
  getTravelerDriverBookings,
  getAllTravelerBookings,
  getTravelerBookingCounts,
} from "../../services/travelerManagementService";
import AdminLayout from "../../components/AdminLayout.jsx";
import UserDetailsModal from "../../components/UserDetailsModal.jsx";
import TravelerDetailsModal from "../../components/admindashboardcomponents/TravelerDetailsModal.jsx";
import { useNotification } from "../../hooks/useNotification";

// Skeleton Components
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        </div>
        <div className="ml-4">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex space-x-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    </td>
  </tr>
);

const StatCardSkeleton = () => (
  <div className="bg-blue-50 p-4 rounded-lg animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
    <div className="h-6 bg-gray-200 rounded w-8"></div>
  </div>
);

const TravelerManagement = () => {
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  // const [bookingDetails, setBookingDetails] = useState(null);
  // const [bookingCounts, setBookingCounts] = useState({});
  // const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [travelerToDelete, setTravelerToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("guide");
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  // Initialize notification hook
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Fetch all travelers on component mount
  useEffect(() => {
    fetchTravelers();
  }, []);

  const fetchTravelers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTravelers();
      setTravelers(data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch travelers";
      setError(errorMessage);
      showError(errorMessage, "Failed to Load Travelers");
      console.error("Error fetching travelers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (traveler) => {
    setSelectedTraveler(traveler);
  };

  const handleDeleteTraveler = async () => {
    if (!travelerToDelete) return;

    try {
      setLoading(true);
      await deleteTraveler(travelerToDelete.id);
      setTravelers(travelers.filter((t) => t.id !== travelerToDelete.id));
      setShowDeleteModal(false);

      const travelerName = `${travelerToDelete.firstName} ${travelerToDelete.lastName}`;
      showSuccess(`${travelerName} has been successfully deleted`);

      // Close details modal if the deleted traveler was selected
      if (selectedTraveler && selectedTraveler.id === travelerToDelete.id) {
        setSelectedTraveler(null);
      }

      setTravelerToDelete(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete traveler";
      showError(errorMessage, "Delete Failed");
      console.error("Error deleting traveler:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (userId) => {
    setSelectedUserId(userId);
    setShowUserDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "BOOKED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter travelers based on search term
  const filteredTravelers = travelers.filter(
    (traveler) =>
      traveler.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.contactNumber.includes(searchTerm)
  );

  const handleRetry = () => {
    showInfo("Retrying to load travelers...");
    fetchTravelers();
  };

  const handleModalError = (errorMessage, title) => {
    showError(errorMessage, title);
  };

  if (error) {
    return (
      <AdminLayout currentPage="traveler-management">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
            <button
              onClick={fetchTravelers}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="traveler-management">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Traveler Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor traveler accounts and their bookings
          </p>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search travelers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-600">Total Travelers: </span>
              {loading ? (
                <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse"></span>
              ) : (
                <span className="font-semibold text-blue-800">
                  {filteredTravelers.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Travelers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Traveler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading
                  ? // Skeleton loading rows
                    Array.from({ length: 8 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  : filteredTravelers.map((traveler) => (
                      <tr key={traveler.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {traveler.profileImageUrl ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={traveler.profileImageUrl}
                                  alt={`${traveler.firstName} ${traveler.lastName}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {traveler.firstName[0]}
                                    {traveler.lastName[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {traveler.firstName} {traveler.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {traveler.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {traveler.contactNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {traveler.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(traveler)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleProfileClick(traveler.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => {
                                setTravelerToDelete(traveler);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traveler Details Modal */}
        <TravelerDetailsModal
          traveler={selectedTraveler}
          isOpen={!!selectedTraveler}
          onClose={() => setSelectedTraveler(null)}
          onProfileClick={handleProfileClick}
          onError={handleModalError}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {travelerToDelete?.firstName}{" "}
                {travelerToDelete?.lastName}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTraveler}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        <UserDetailsModal
          isOpen={showUserDetailsModal}
          onClose={() => setShowUserDetailsModal(false)}
          userId={selectedUserId}
        />
      </div>
    </AdminLayout>
  );
};

export default TravelerManagement;
