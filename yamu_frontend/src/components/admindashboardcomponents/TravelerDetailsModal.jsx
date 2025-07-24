import React, { useState, useEffect } from "react";
import {
  getTravelerBookingCounts,
  getAllTravelerBookings,
} from "../../services/travelerManagementService";

// Skeleton Components
const StatCardSkeleton = () => (
  <div className="bg-blue-50 p-4 rounded-lg animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
    <div className="h-6 bg-gray-200 rounded w-8"></div>
  </div>
);

const TravelerDetailsModal = ({
  traveler,
  isOpen,
  onClose,
  onProfileClick,
  onError,
}) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingCounts, setBookingCounts] = useState({});
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState("guide");

  // Reset state when traveler changes
  useEffect(() => {
    if (traveler && isOpen) {
      setActiveTab("guide");
      fetchBookingDetails();
    } else {
      // Reset state when modal closes
      setBookingDetails(null);
      setBookingCounts({});
      setLoadingBookings(false);
    }
  }, [traveler, isOpen]);

  const fetchBookingDetails = async () => {
    if (!traveler) return;

    try {
      setLoadingBookings(true);

      // Fetch booking counts and details
      const [counts, allBookings] = await Promise.all([
        getTravelerBookingCounts(traveler.id),
        getAllTravelerBookings(traveler.id),
      ]);

      setBookingCounts(counts);
      setBookingDetails(allBookings);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch booking details";
      if (onError) {
        onError(errorMessage, "Failed to Load Booking Details");
      }
      console.error("Error fetching booking details:", err);
    } finally {
      setLoadingBookings(false);
    }
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

  const handleProfileClick = (userId) => {
    if (onProfileClick) {
      onProfileClick(userId);
    }
  };

  if (!isOpen || !traveler) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto m-4 w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {traveler.firstName} {traveler.lastName} - Booking Details
            </h2>
            <button
              onClick={onClose}
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
                    Hotel Bookings ({bookingDetails?.hotelBookings?.length || 0}
                    )
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
                      bookingDetails.guideReservations.map((reservation) => (
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
                                    handleProfileClick(reservation.guideId)
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
                                      <strong>Day {day.dayNumber}:</strong>{" "}
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
                                        <strong>Vehicle Details:</strong>{" "}
                                        {day.vehicleDetails}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
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
                                Booking Reference: {booking.bookingReference}
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
                                <strong>Room Type:</strong> {booking.roomType}
                              </p>
                              <p>
                                <strong>Rooms:</strong> {booking.numberOfRooms}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Guests:</strong>{" "}
                                {booking.numberOfGuests}
                              </p>
                              <p>
                                <strong>Total Price:</strong>{" "}
                                {booking.currencyCode} {booking.totalPrice}
                              </p>
                              <p>
                                <strong>Payment:</strong>{" "}
                                {booking.paymentStatus}
                              </p>
                              <p>
                                <strong>Method:</strong> {booking.paymentMethod}
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
                                Driver: {booking.driver.name}
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
                                <strong>To:</strong> {booking.endLocationName}
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
  );
};

export default TravelerDetailsModal;
