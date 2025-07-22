import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  MessageSquare,
  Trash2,
} from "lucide-react";
import {
  getGuideAnalytics,
  getGuideReservations,
  getGuideReviews,
  deleteGuideReview,
} from "../../services/guideAnalyticsService";

const GuideDetailsModal = ({
  guide,
  isOpen,
  onClose,
  onProfileClick,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (guide && isOpen) {
      fetchGuideData();
    }
  }, [guide, isOpen]);

  const fetchGuideData = async () => {
    if (!guide) return;

    try {
      setLoading(true);
      const data = await getGuideAnalytics(guide.id);
      setAnalytics(data);
      setReservations(data.reservations || []);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching guide data:", error);
      onError?.("Failed to load guide details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;
    try {
      setDeletingReviewId(reviewId);
      await deleteGuideReview(reviewId);
      // Refresh the data after deletion
      await fetchGuideData();
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      onError?.("Failed to delete review");
    } finally {
      setDeletingReviewId(null);
      setShowDeleteModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen || !guide) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {guide.profileImageUrl ? (
                <img
                  className="w-16 h-16 rounded-full object-cover"
                  src={guide.profileImageUrl}
                  alt={`${guide.firstName} ${guide.lastName}`}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-lg">
                    {guide.firstName?.[0]}
                    {guide.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {guide.firstName} {guide.lastName}
              </h2>
              <p className="text-gray-600">
                {guide.expertiseCityRegion} • {guide.language}
              </p>
              <div className="flex items-center mt-2">
                {guide.isVerified ? (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "reservations", label: "Reservations" },
              { id: "reviews", label: "Reviews" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-blue-600 text-sm font-medium">
                        Total Reservations
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {analytics?.totalReservations || 0}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-green-600 text-sm font-medium">
                        Total Reviews
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {analytics?.totalReviews || 0}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-yellow-600 text-sm font-medium">
                        Average Rating
                      </div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {analytics?.averageRating
                          ? analytics.averageRating.toFixed(1)
                          : "N/A"}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-purple-600 text-sm font-medium">
                        Guide ID
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {guide.id}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{guide.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          {guide.contactNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{guide.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  {guide.about && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        About
                      </h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {guide.about}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => onProfileClick(guide.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Reservations Tab */}
              {activeTab === "reservations" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reservations ({reservations.length})
                  </h3>
                  {reservations.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No reservations found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="bg-gray-50 p-4 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-gray-400" />
                              <div>
                                <span className="font-medium text-gray-900">
                                  {reservation.traveler?.firstName}{" "}
                                  {reservation.traveler?.lastName}
                                </span>
                                <div className="text-sm text-gray-500">
                                  {reservation.traveler?.email} •{" "}
                                  {reservation.traveler?.contactNumber}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                                reservation.status
                              )}`}
                            >
                              {reservation.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Created: {formatDate(reservation.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                Days: {reservation.numberOfDays}
                              </span>
                            </div>
                          </div>

                          {/* Day Details */}
                          {reservation.dayDetails &&
                            reservation.dayDetails.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">
                                  Itinerary:
                                </h4>
                                {reservation.dayDetails.map((day, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded border text-sm"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">
                                          Day {day.dayNumber}: {day.places}
                                        </div>
                                        <div className="text-gray-600">
                                          Date: {formatDate(day.date)} •
                                          Travelers: {day.numberOfTravelers}
                                        </div>
                                        {day.vehicleRequested && (
                                          <div className="text-blue-600 mt-1">
                                            🚗 Vehicle requested:{" "}
                                            {day.vehicleDetails || "No details"}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reviews ({reviews.length})
                  </h3>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No reviews found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-gray-50 p-4 rounded-lg border"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="flex items-center space-x-2">
                                  <User className="w-5 h-5 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {review.travelerName}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-gray-600 ml-2">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>

                              {review.comment && (
                                <p className="text-gray-700 mb-2">
                                  {review.comment}
                                </p>
                              )}

                              <div className="text-xs text-gray-500">
                                {formatDate(review.createdAt)}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setReviewToDelete(review);
                                setShowDeleteModal(true);
                              }}
                              disabled={deletingReviewId === review.id}
                              className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Delete review"
                            >
                              {deletingReviewId === review.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Delete Review Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Review
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this review by{" "}
              {reviewToDelete?.travelerName}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReviewToDelete(null);
                }}
                disabled={deletingReviewId === reviewToDelete?.id}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReview(reviewToDelete?.id)}
                disabled={deletingReviewId === reviewToDelete?.id}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {deletingReviewId === reviewToDelete?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDetailsModal;
