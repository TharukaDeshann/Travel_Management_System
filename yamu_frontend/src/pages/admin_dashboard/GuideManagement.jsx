import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  User, 
  Trash2, 
  Search, 
  Filter,
  Star,
  StarHalf,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  Award,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Globe
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import GuideDetailsModal from "../../components/admindashboardcomponents/GuideDetailsModal";
import UserDetailsModal from "../../components/UserDetailsModal";
import {
  getAllGuides,
  deleteUser,
  getGuideAnalytics,
  getAllGuidesAnalytics,
} from "../../services/guideAnalyticsService";

// Enhanced skeleton loader component with better design
const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="px-6 py-5">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
        <div className="ml-4 space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-20"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-28"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-5">
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
      </div>
    </td>
    <td className="px-6 py-5">
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-28"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
      </div>
    </td>
    <td className="px-6 py-5">
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
    </td>
    <td className="px-6 py-5">
      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
    </td>
    <td className="px-6 py-5">
      <div className="flex space-x-2">
        <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
        <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
        <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
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
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const guidesPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchGuidesData();
  }, []);

  const fetchGuidesData = async () => {
    try {
      setLoading(true);
      setError("");

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
      await fetchGuidesData();
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

  // Pagination logic
  const totalPages = Math.ceil(filteredGuides.length / guidesPerPage);
  const indexOfLastGuide = currentPage * guidesPerPage;
  const indexOfFirstGuide = indexOfLastGuide - guidesPerPage;
  const currentGuides = filteredGuides.slice(indexOfFirstGuide, indexOfLastGuide);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (guide) => {
    if (!guide.isVerified) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
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
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Underperforming
        </span>
      );
    }

    if (guide.averageRating !== null && guide.averageRating >= 4.5) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
          <Award className="w-3 h-3 mr-1" />
          Top Rated
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
        <Shield className="w-3 h-3 mr-1" />
        Verified
      </span>
    );
  };

  const getRatingDisplay = (guide) => {
    if (guide.averageRating === null) {
      return <span className="text-gray-400 text-sm">No ratings yet</span>;
    }

    const rating = guide.averageRating;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          ))}
          {hasHalfStar && <StarHalf className="w-4 h-4 text-yellow-400 fill-current" />}
          {[...Array(emptyStars)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gray-300" />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
        <span className="text-xs text-gray-500">({guide.totalReviews})</span>
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

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          Showing {indexOfFirstGuide + 1} to {Math.min(indexOfLastGuide, totalGuides)} of {totalGuides} guides
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                currentPage === number
                  ? 'text-blue-600 bg-blue-50 border border-blue-200'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout currentPage="guide-management">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Guide Management</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Manage and monitor guide accounts, their performance, and reviews
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search guides by name, email, city, or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Guides</p>
                  {loading ? (
                    <div className="w-12 h-8 bg-blue-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-blue-700">{totalGuides}</p>
                  )}
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Verified</p>
                  {loading ? (
                    <div className="w-12 h-8 bg-emerald-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-emerald-700">{verifiedGuides}</p>
                  )}
                </div>
                <Shield className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Top Rated</p>
                  {loading ? (
                    <div className="w-12 h-8 bg-yellow-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-yellow-700">{topRatedGuides}</p>
                  )}
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Underperforming</p>
                  {loading ? (
                    <div className="w-12 h-8 bg-red-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-red-700">{underperformingGuides}</p>
                  )}
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Guides Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Guide Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location & Language
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading
                  ? Array.from({ length: guidesPerPage }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  : currentGuides.map((guide) => (
                      <tr key={guide.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {guide.profileImageUrl ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                  src={guide.profileImageUrl}
                                  alt={`${guide.firstName} ${guide.lastName}`}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                                  <span className="text-white font-semibold text-lg">
                                    {guide.firstName?.[0]}{guide.lastName?.[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {guide.firstName} {guide.lastName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <span className="bg-gray-100 px-2 py-1 rounded-md">ID: {guide.id}</span>
                              </div>
                              <div className="text-xs text-gray-600 flex items-center mt-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {guide.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {guide.contactNumber || 'Not provided'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {guide.expertiseCityRegion}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Globe className="w-4 h-4 mr-2 text-gray-400" />
                              {guide.language}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {getRatingDisplay(guide)}
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(guide)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(guide)}
                              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 tooltip"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleProfileClick(guide.id)}
                              className="inline-flex items-center justify-center w-8 h-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors duration-200"
                              title="View Profile"
                            >
                              <User className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setGuideToDelete(guide);
                                setShowDeleteModal(true);
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                              title="Delete Guide"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination />

          {!loading && currentGuides.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No guides found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "No guides have been registered yet."}
              </p>
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

        {/* Enhanced Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
                Delete Guide Account
              </h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                Are you sure you want to delete <strong>{guideToDelete?.firstName} {guideToDelete?.lastName}</strong>? 
                This action will permanently remove the guide and all associated data including reservations and reviews.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGuide}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Delete Guide
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