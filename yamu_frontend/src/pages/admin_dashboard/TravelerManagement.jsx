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
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingCounts, setBookingCounts] = useState({});
  const [loadingBookings, setLoadingBookings] = useState(false);
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
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch travelers";
      setError(errorMessage);
      showError(errorMessage, "Failed to Load Travelers");
      console.error("Error fetching travelers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (traveler) => {
    try {
      setSelectedTraveler(traveler);
      setLoadingBookings(true);

      // Fetch booking counts and details
      const [counts, allBookings] = await Promise.all([
        getTravelerBookingCounts(traveler.id),
        getAllTravelerBookings(traveler.id),
      ]);

      setBookingCounts(counts);
      setBookingDetails(allBookings);
      // showInfo(`Loaded booking details for ${traveler.firstName} ${traveler.lastName}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch booking details";
      showError(errorMessage, "Failed to Load Booking Details");
      console.error("Error fetching booking details:", err);
    } finally {
      setLoadingBookings(false);
    }
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
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete traveler";
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
        {selectedTraveler && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto m-4 w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTraveler.firstName} {selectedTraveler.lastName} -
                    Booking Details
                  </h2>
                  <button
                    onClick={() => setSelectedTraveler(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Booking Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {loadingBookings ? (
                    <>
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                      <StatCardSkeleton />
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800">
                          Guide Reservations
                        </h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {bookingCounts.guideReservationsCount || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-800">
                          Hotel Bookings
                        </h3>
                        <p className="text-2xl font-bold text-green-600">
                          {bookingCounts.hotelBookingsCount || 0}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-purple-800">
                          Driver Bookings
                        </h3>
                        <p className="text-2xl font-bold text-purple-600">
                          {bookingCounts.driverBookingsCount || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-800">
                          Total Bookings
                        </h3>
                        <p className="text-2xl font-bold text-gray-600">
                          {bookingCounts.totalBookings || 0}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {loadingBookings ? (
                  <div className="space-y-4">
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          onClick={() => setActiveTab("guide")}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "guide"
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Guide Reservations (
                          {bookingDetails?.guideReservations?.length || 0})
                        </button>
                        <button
                          onClick={() => setActiveTab("hotel")}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "hotel"
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Hotel Bookings (
                          {bookingDetails?.hotelBookings?.length || 0})
                        </button>
                        <button
                          onClick={() => setActiveTab("driver")}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "driver"
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Driver Bookings (
                          {bookingDetails?.driverBookings?.length || 0})
                        </button>
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px]">
                      {activeTab === "guide" && (
                        <div className="space-y-4">
                          {bookingDetails?.guideReservations?.length > 0 ? (
                            bookingDetails.guideReservations.map(
                              (reservation) => (
                                <div
                                  key={reservation.id}
                                  className="bg-gray-50 rounded-lg p-4"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        Reservation #{reservation.id}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        Guide:
                                        <button
                                          onClick={() =>
                                            handleProfileClick(
                                              reservation.guideId
                                            )
                                          }
                                          className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                          {reservation.guideName}
                                        </button>
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                        reservation.status
                                      )}`}
                                    >
                                      {reservation.status}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p>
                                        <strong>Days:</strong>{" "}
                                        {reservation.numberOfDays}
                                      </p>
                                      <p>
                                        <strong>Guide Contact:</strong>{" "}
                                        {reservation.guideContact}
                                      </p>
                                    </div>
                                    <div>
                                      <p>
                                        <strong>Created:</strong>{" "}
                                        {formatDateTime(reservation.createdAt)}
                                      </p>
                                      <p>
                                        <strong>Updated:</strong>{" "}
                                        {formatDateTime(reservation.updatedAt)}
                                      </p>
                                    </div>
                                  </div>
                                  {reservation.dayDetails && (
                                    <div className="mt-3">
                                      <h5 className="font-medium text-gray-900 mb-2">
                                        Day Details:
                                      </h5>
                                      <div className="space-y-2">
                                        {reservation.dayDetails.map((day) => (
                                          <div
                                            key={day.dayNumber}
                                            className="bg-white p-2 rounded border"
                                          >
                                            <p>
                                              <strong>
                                                Day {day.dayNumber}:
                                              </strong>{" "}
                                              {day.places}
                                            </p>
                                            <p>
                                              <strong>Date:</strong>{" "}
                                              {formatDate(day.date)}
                                            </p>
                                            <p>
                                              <strong>Travelers:</strong>{" "}
                                              {day.numberOfTravelers}
                                            </p>
                                            <p>
                                              <strong>Vehicle:</strong>{" "}
                                              {day.vehicleRequested
                                                ? "Requested"
                                                : "Not Requested"}
                                            </p>
                                            {day.vehicleDetails && (
                                              <p>
                                                <strong>
                                                  Vehicle Details:
                                                </strong>{" "}
                                                {day.vehicleDetails}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-gray-500 text-center py-8">
                              No guide reservations found
                            </p>
                          )}
                        </div>
                      )}

                      {activeTab === "hotel" && (
                        <div className="space-y-4">
                          {bookingDetails?.hotelBookings?.length > 0 ? (
                            bookingDetails.hotelBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="bg-gray-50 rounded-lg p-4"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {booking.hotel.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Booking Reference:{" "}
                                      {booking.bookingReference}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                      booking.bookingStatus
                                    )}`}
                                  >
                                    {booking.bookingStatus}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p>
                                      <strong>Check-in:</strong>{" "}
                                      {formatDate(booking.checkInDate)}
                                    </p>
                                    <p>
                                      <strong>Check-out:</strong>{" "}
                                      {formatDate(booking.checkOutDate)}
                                    </p>
                                    <p>
                                      <strong>Room Type:</strong>{" "}
                                      {booking.roomType}
                                    </p>
                                    <p>
                                      <strong>Rooms:</strong>{" "}
                                      {booking.numberOfRooms}
                                    </p>
                                  </div>
                                  <div>
                                    <p>
                                      <strong>Guests:</strong>{" "}
                                      {booking.numberOfGuests}
                                    </p>
                                    <p>
                                      <strong>Total Price:</strong>{" "}
                                      {booking.currencyCode}{" "}
                                      {booking.totalPrice}
                                    </p>
                                    <p>
                                      <strong>Payment:</strong>{" "}
                                      {booking.paymentStatus}
                                    </p>
                                    <p>
                                      <strong>Method:</strong>{" "}
                                      {booking.paymentMethod}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <p className="text-sm">
                                    <strong>Hotel Address:</strong>{" "}
                                    {booking.hotel.address}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Hotel Rating:</strong>{" "}
                                    {booking.hotel.rating}/5 (
                                    {booking.hotel.totalRatings} reviews)
                                  </p>
                                  {booking.specialRequests && (
                                    <p className="text-sm">
                                      <strong>Special Requests:</strong>{" "}
                                      {booking.specialRequests}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-center py-8">
                              No hotel bookings found
                            </p>
                          )}
                        </div>
                      )}

                      {activeTab === "driver" && (
                        <div className="space-y-4">
                          {bookingDetails?.driverBookings?.length > 0 ? (
                            bookingDetails.driverBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="bg-gray-50 rounded-lg p-4"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      Driver Booking #{booking.id}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Driver:
                                      {booking.driver.name}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                      booking.status
                                    )}`}
                                  >
                                    {booking.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p>
                                      <strong>Booking Date:</strong>{" "}
                                      {formatDate(booking.bookingDate)}
                                    </p>
                                    <p>
                                      <strong>Driver Rating:</strong>{" "}
                                      {booking.driver.rating}/5
                                    </p>
                                    <p>
                                      <strong>Vehicle:</strong>{" "}
                                      {booking.driver.vehicleBrand}{" "}
                                      {booking.driver.vehicleModel}
                                    </p>
                                    <p>
                                      <strong>Vehicle Number:</strong>{" "}
                                      {booking.driver.vehicleNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <p>
                                      <strong>Vehicle Type:</strong>{" "}
                                      {booking.driver.vehicleType}
                                    </p>
                                    <p>
                                      <strong>Vehicle Color:</strong>{" "}
                                      {booking.driver.vehicleColor}
                                    </p>
                                    <p>
                                      <strong>From:</strong>{" "}
                                      {booking.startLocationName}
                                    </p>
                                    <p>
                                      <strong>To:</strong>{" "}
                                      {booking.endLocationName}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-center py-8">
                              No driver bookings found
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

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
