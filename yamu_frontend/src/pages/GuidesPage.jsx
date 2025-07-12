import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Languages, Car, Star, Users, Shield } from 'lucide-react';
import GuideModal from '../components/GuideModal';
import apiClient from '../services/axiosInstance';
import { fetchUsersByRole } from '../services/userService';

import VehicleManagement from '../components/VehicleManagement';
import { useUser } from '../context/UserContext';
import { Star } from 'lucide-react';


import { Layout } from '../components/Layout'; // Added import


const GuidesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = location.state?.currentUser;
  const [guides, setGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterVehicle, setFilterVehicle] = useState(false);
  const [guideRatings, setGuideRatings] = useState({});
  // Layout-related state
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const [unreadCount, setUnreadCount] = useState(0);
  const loggedUser = currentUser; // or use context if available

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const response = await fetchUsersByRole('GUIDE');

        setGuides(response);

        // Fetch ratings for all guides
        const ratings = {};
        await Promise.all(
          response.map(async (guide) => {
            try {
              const ratingResponse = await apiClient.get(`/api/reviews/guide/${guide.id}/average-rating`);
              ratings[guide.id] = ratingResponse.data || 0;
            } catch (error) {
              ratings[guide.id] = 0;
            }
          })
        );
        setGuideRatings(ratings);

      } catch (error) {
        console.error("Error fetching guides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filteredAndSortedGuides = guides
    .filter(guide => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        (guide.firstName + ' ' + guide.lastName).toLowerCase().includes(searchLower) ||
        guide.expertiseCityRegion.toLowerCase().includes(searchLower) ||
        guide.language.toLowerCase().includes(searchLower)
      );

      const matchesVerified = !filterVerified || guide.verified;
      const matchesVehicle = !filterVehicle || guide.vehicleAvailability;

      return matchesSearch && matchesVerified && matchesVehicle;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName);
        case 'rating':
          return (guideRatings[b.id] || 0) - (guideRatings[a.id] || 0);
        case 'location':
          return a.expertiseCityRegion.localeCompare(b.expertiseCityRegion);
        default:
          return 0;
      }
    });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={rating >= star ? '#FFD700' : 'none'}
            color={rating >= star ? '#FFD700' : '#ddd'}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">
          {rating > 0 ? `(${rating.toFixed(1)})` : '(No ratings)'}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Guides...</p>
        </div>
      </div>

    );
  }

  return (
    <Layout
      user={loggedUser}
      unreadCount={unreadCount}
      onCurrencyChange={setSelectedCurrency}
      selectedCurrency={selectedCurrency}
      navigate={navigate}
      location={location}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header Section */}
        <div className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Discover Amazing Tour Guides
              </h1>
              <p className="text-lg text-gray-600">
                Find expert local guides for unforgettable travel experiences
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Bar */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, region, or language..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="location">Sort by Location</option>
                  </select>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterVerified(!filterVerified)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                      filterVerified
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Shield size={16} />
                    <span className="text-sm">Verified</span>
                  </button>
                  <button
                    onClick={() => setFilterVehicle(!filterVehicle)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                      filterVehicle
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Car size={16} />
                    <span className="text-sm">Vehicle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {filteredAndSortedGuides.length} guides found
              </p>

            </div>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredAndSortedGuides.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No guides found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedGuides.map(guide => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  {/* Guide Image */}
                  <div className="relative">
                    <img
                      src={guide.profileImageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={`${guide.firstName} ${guide.lastName}`}
                      className="w-full h-48 object-cover"
                    />

                    {/* Verified Badge */}
                    {guide.verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Shield size={12} />
                        Verified
                      </div>
                    )}

                    {/* Rating Overlay */}
                    {guideRatings[guide.id] > 0 && (
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                        <div className="flex items-center gap-1">
                          <Star size={14} fill="#FFD700" color="#FFD700" />
                          <span className="text-sm font-medium">{guideRatings[guide.id].toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guide Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {guide.firstName} {guide.lastName}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" />
                        <span>{guide.expertiseCityRegion}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Languages size={14} className="text-green-500" />
                        <span>{guide.language}</span>
                      </div>

                      {guide.vehicleAvailability && (
                        <div className="flex items-center gap-2">
                          <Car size={14} className="text-purple-500" />
                          <span>Vehicle Available</span>
                        </div>
                      )}
                    </div>

                    {/* Rating Stars */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {renderStars(guideRatings[guide.id] || 0)}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGuide(guide);
                        }}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guide Modal */}
        {selectedGuide && (
          <GuideModal
            guide={selectedGuide}
            onClose={() => setSelectedGuide(null)}
            currentUser={currentUser}
          />
        )}
      </div>
    </Layout>
  );
};

export default GuidesPage;