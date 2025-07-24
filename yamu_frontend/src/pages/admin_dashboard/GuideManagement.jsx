import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import GuideDetailsModal from "../../components/admindashboardcomponents/GuideDetailsModal";
import UserDetailsModal from "../../components/UserDetailsModal";
import {
  getAllGuides,
  deleteUser,
  getGuideAnalytics,
  getAllGuidesAnalytics,
} from "../../services/guideAnalyticsService";

// Skeleton loader component
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="ml-4">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
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

const GuideManagement = () => {
  const [guides, setGuides] = useState([]);
  const [guidesAnalytics, setGuidesAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [guideToDelete, setGuideToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, verified, unverified, underperforming
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchGuidesData();
  }, []);

  const fetchGuidesData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch both guides and their analytics
      const [guidesData, analyticsData] = await Promise.all([
        getAllGuides(),
        getAllGuidesAnalytics(),
      ]);

      setGuides(guidesData);
      setGuidesAnalytics(analyticsData);
    } catch (error) {
      console.error("Error fetching guides data:", error);
      setError("Failed to load guides data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (guide) => {
    try {
      setSelectedGuide(guide);
    } catch (error) {
      console.error("Error opening guide details:", error);
      setError("Failed to load guide details.");
    }
  };

  const handleProfileClick = (guideId) => {
    setSelectedUserId(guideId);
    setShowUserDetailsModal(true);
  };

  const handleDeleteGuide = async () => {
    if (!guideToDelete) return;

    try {
      await deleteUser(guideToDelete.id);
      await fetchGuidesData(); // Refresh the list
      setShowDeleteModal(false);
      setGuideToDelete(null);
    } catch (error) {
      console.error("Error deleting guide:", error);
      setError("Failed to delete guide. Please try again.");
      setShowDeleteModal(false);
    }
  };

  const handleModalError = (errorMessage) => {
    setError(errorMessage);
  };

  // Enhanced filtering logic
  const filteredGuides = guidesAnalytics.filter((guide) => {
    const matchesSearch =
      guide.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.expertiseCityRegion
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      guide.language?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterStatus) {
        case "verified":
          return guide.isVerified === true;
        case "unverified":
          return guide.isVerified === false;
        case "underperforming":
          return (
            guide.averageRating !== null &&
            guide.averageRating < 3.0 &&
            guide.totalReviews > 0
          );
        case "all":
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (guide) => {
    if (!guide.isVerified) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
          Unverified
        </span>
      );
    }

    if (
      guide.averageRating !== null &&
      guide.averageRating < 3.0 &&
      guide.totalReviews > 0
    ) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
          Underperforming
        </span>
      );
    }

    if (guide.averageRating !== null && guide.averageRating >= 4.5) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
          Top Rated
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
        Verified
      </span>
    );
  };

  const getRatingDisplay = (guide) => {
    if (guide.averageRating === null) {
      return <span className="text-gray-400">No ratings</span>;
    }

    const rating = guide.averageRating;
    const stars =
      "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));

    return (
      <div className="flex items-center">
        <span className="text-yellow-400 mr-1">{stars}</span>
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        <span className="text-xs text-gray-500 ml-1">
          ({guide.totalReviews})
        </span>
      </div>
    );
  };

  // Summary statistics
  const totalGuides = filteredGuides.length;
  const verifiedGuides = filteredGuides.filter((g) => g.isVerified).length;
  const underperformingGuides = filteredGuides.filter(
    (g) =>
      g.averageRating !== null && g.averageRating < 3.0 && g.totalReviews > 0
  ).length;
  const topRatedGuides = filteredGuides.filter(
    (g) => g.averageRating !== null && g.averageRating >= 4.5
  ).length;

  return (
    <AdminLayout currentPage="guide-management">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Guide Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor guide accounts, their performance, and reviews
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search, Filter and Stats */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search guides by name, email, city, or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="all">All Guides</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
                <option value="underperforming">Underperforming</option>
              </select>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 px-4 py-3 rounded-lg">
              <div className="text-sm text-blue-600">Total Guides</div>
              {loading ? (
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <div className="text-xl font-semibold text-blue-800">
                  {totalGuides}
                </div>
              )}
            </div>

            <div className="bg-green-50 px-4 py-3 rounded-lg">
              <div className="text-sm text-green-600">Verified</div>
              {loading ? (
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <div className="text-xl font-semibold text-green-800">
                  {verifiedGuides}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 px-4 py-3 rounded-lg">
              <div className="text-sm text-yellow-600">Top Rated</div>
              {loading ? (
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <div className="text-xl font-semibold text-yellow-800">
                  {topRatedGuides}
                </div>
              )}
            </div>

            <div className="bg-red-50 px-4 py-3 rounded-lg">
              <div className="text-sm text-red-600">Underperforming</div>
              {loading ? (
                <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <div className="text-xl font-semibold text-red-800">
                  {underperformingGuides}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guides Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guide
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expertise & Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading
                  ? Array.from({ length: 8 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  : filteredGuides.map((guide) => (
                      <tr key={guide.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {guide.profileImageUrl ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={guide.profileImageUrl}
                                  alt={`${guide.firstName} ${guide.lastName}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {guide.firstName?.[0]}
                                    {guide.lastName?.[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {guide.firstName} {guide.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {guide.id}
                              </div>
                              <div className="text-xs text-gray-400">
                                {guide.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guide.contactNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {guide.expertiseCityRegion}
                          </div>
                          <div className="text-sm text-gray-500">
                            {guide.language}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRatingDisplay(guide)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(guide)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(guide)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleProfileClick(guide.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => {
                                setGuideToDelete(guide);
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

          {!loading && filteredGuides.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || filterStatus !== "all"
                  ? "No guides found matching your criteria."
                  : "No guides found."}
              </div>
            </div>
          )}
        </div>

        {/* Guide Details Modal */}
        <GuideDetailsModal
          guide={selectedGuide}
          isOpen={!!selectedGuide}
          onClose={() => setSelectedGuide(null)}
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
                Are you sure you want to delete {guideToDelete?.firstName}{" "}
                {guideToDelete?.lastName}? This action will remove the guide and
                all associated data including reservations and reviews.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGuide}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        <UserDetailsModal
          isOpen={showUserDetailsModal}
          onClose={() => setShowUserDetailsModal(false)}
          userId={selectedUserId}
        />
      </div>
    </AdminLayout>
  );
};

export default GuideManagement;
