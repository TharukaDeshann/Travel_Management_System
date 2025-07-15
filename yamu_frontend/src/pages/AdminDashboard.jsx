import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext.jsx';
import { Layout } from '../components/Layout.jsx';
import { fetchLoggedInUser } from "../services/authService";
import guideSearchService from "../services/guideSearchService";
import { Search, User, Car, Star, MapPin, Calendar, Filter, Eye, BarChart3, Users, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [filters, setFilters] = useState({
    region: '',
    language: '',
    minRating: '',
    vehicleType: '',
    reservationStatus: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await fetchLoggedInUser();
        setCurrentUser(user);
        
        
        // Load initial stats
        const statsData = await guideSearchService.getGuideStats();
        setStats(statsData);
        
        // Load initial search results
        const initialResults = await guideSearchService.searchGuides({ size: 20 });
        setSearchResults(initialResults);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {
        query: searchQuery || '*',
        size: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };
      
      const results = await guideSearchService.searchGuides(params);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      language: '',
      minRating: '',
      vehicleType: '',
      reservationStatus: ''
    });
    setSearchQuery('');
  };

  const viewGuideDetails = async (guideId) => {
    try {
      const guide = await guideSearchService.getGuideById(guideId);
      setSelectedGuide(guide);
    } catch (error) {
      console.error('Error fetching guide details:', error);
    }
  };

  const getTopRatedGuides = async () => {
    setLoading(true);
    try {
      const results = await guideSearchService.getTopRatedGuides(4, 0, 20);
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('Error fetching top rated guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGuidesWithUpcomingReservations = async () => {
    setLoading(true);
    try {
      const results = await guideSearchService.getGuidesWithUpcomingReservations(0, 20);
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('Error fetching upcoming reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const SearchFilters = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Search Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Regions</option>
            <option value="Colombo">Colombo</option>
            <option value="Kandy">Kandy</option>
            <option value="Galle">Galle</option>
            <option value="Jaffna">Jaffna</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select
            value={filters.language}
            onChange={(e) => handleFilterChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Sinhala">Sinhala</option>
            <option value="Tamil">Tamil</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
          <select
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Rating</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
          <select
            value={filters.vehicleType}
            onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Vehicles</option>
            <option value="Car">Car</option>
            <option value="Van">Van</option>
            <option value="Bus">Bus</option>
            <option value="Jeep">Jeep</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.reservationStatus}
            onChange={(e) => handleFilterChange('reservationStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
        <button
          onClick={clearFilters}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  const GuideCard = ({ guide }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{guide.firstName} {guide.lastName}</h3>
            <p className="text-gray-600 text-sm">{guide.expertiseCityRegion}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{guide.averageRating?.toFixed(1) || 'N/A'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{guide.guideLanguage}</span>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{guide.vehicleType || 'No Vehicle'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{guide.totalReservations || 0} Reservations</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{guide.totalReviews || 0} Reviews</span>
        </div>
      </div>
      
      {guide.isVerified && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">Verified Guide</span>
        </div>
      )}
      
      <button
        onClick={() => viewGuideDetails(guide.guideId)}
        className="w-full bg-blue-50 text-blue-600 py-2 rounded-md hover:bg-blue-100 flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>
    </div>
  );

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={getTopRatedGuides}
          className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
        >
          <Star className="w-6 h-6 mb-2" />
          <span className="font-medium">Top Rated Guides</span>
        </button>
        <button
          onClick={getGuidesWithUpcomingReservations}
          className="p-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all"
        >
          <Calendar className="w-6 h-6 mb-2" />
          <span className="font-medium">Upcoming Reservations</span>
        </button>
        <button
          onClick={() => guideSearchService.getGuidesWithAvailableVehicles().then(setSearchResults)}
          className="p-4 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-lg hover:from-green-500 hover:to-teal-600 transition-all"
        >
          <Car className="w-6 h-6 mb-2" />
          <span className="font-medium">Available Vehicles</span>
        </button>
      </div>
    </div>
  );

  const GuideDetailsModal = ({ guide, onClose }) => {
    if (!guide) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Guide Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {guide.firstName} {guide.lastName}</p>
                  <p><span className="font-medium">Email:</span> {guide.email}</p>
                  <p><span className="font-medium">Phone:</span> {guide.contactNumber}</p>
                  <p><span className="font-medium">Region:</span> {guide.expertiseCityRegion}</p>
                  <p><span className="font-medium">Language:</span> {guide.guideLanguage}</p>
                  <p><span className="font-medium">Verified:</span> {guide.isVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Vehicle Type:</span> {guide.vehicleType || 'N/A'}</p>
                  <p><span className="font-medium">Model:</span> {guide.vehicleModel || 'N/A'}</p>
                  <p><span className="font-medium">Capacity:</span> {guide.vehicleCapacity || 'N/A'}</p>
                  <p><span className="font-medium">AC:</span> {guide.vehicleAirConditioned ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Available:</span> {guide.vehicleAvailable ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Statistics</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Total Reservations:</span> {guide.totalReservations || 0}</p>
                  <p><span className="font-medium">Completed:</span> {guide.completedReservations || 0}</p>
                  <p><span className="font-medium">Confirmed:</span> {guide.confirmedReservations || 0}</p>
                  <p><span className="font-medium">Pending:</span> {guide.pendingReservations || 0}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Reviews</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Total Reviews:</span> {guide.totalReviews || 0}</p>
                  <p><span className="font-medium">Average Rating:</span> {guide.averageRating?.toFixed(1) || 'N/A'}</p>
                  {guide.reviewComment && (
                    <p><span className="font-medium">Latest Review:</span> {guide.reviewComment}</p>
                  )}
                </div>
              </div>
            </div>
            
            {guide.guideAbout && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">About</h3>
                <p className="text-gray-700">{guide.guideAbout}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout onCurrencyChange={() => {}} selectedCurrency="LKR">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onCurrencyChange={() => {}} selectedCurrency="LKR">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage guide activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Guides"
            value={stats?.totalGuides || 0}
            icon={Users}
            color="bg-blue-500"
          />
          <StatsCard
            title="Active Vehicles"
            value={searchResults?.results?.filter(g => g.vehicleAvailable).length || 0}
            icon={Car}
            color="bg-green-500"
          />
          <StatsCard
            title="Verified Guides"
            value={searchResults?.results?.filter(g => g.isVerified).length || 0}
            icon={Activity}
            color="bg-purple-500"
          />
          <StatsCard
            title="Avg Rating"
            value={searchResults?.results?.reduce((acc, g) => acc + (g.averageRating || 0), 0) / (searchResults?.results?.length || 1) || 0}
            icon={Star}
            color="bg-yellow-500"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Search Filters */}
        <SearchFilters />

        {/* Search Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Guide Search Results</h2>
            <span className="text-sm text-gray-600">
              {searchResults?.totalCount || 0} guides found
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults?.results?.map((guide) => (
              <GuideCard key={guide.guideId} guide={guide} />
            ))}
          </div>
          
          {searchResults?.results?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No guides found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Guide Details Modal */}
        {selectedGuide && (
          <GuideDetailsModal
            guide={selectedGuide}
            onClose={() => setSelectedGuide(null)}
          />
        )}
      </div>
    </Layout>
  );
}