import React, { useEffect, useState } from 'react';
import { 
  searchGuides, 
  getGuideStats, 
  getTopRatedGuides, 
  getGuidesWithAvailableVehicles 
} from '../../services/guideSearchService';
import AdminLayout from '../../components/AdminLayout';
import { Input } from 'antd';
import { Button } from 'antd';
import { Loader2, User, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, Eye, Car, Star, Clock, Users, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const regions = ['Colombo', 'Kandy', 'Galle', 'Matara', 'Negombo', 'Anuradhapura', 'Polonnaruwa', 'Nuwara Eliya', 'Ella', 'Sigiriya'];
const languages = ['English', 'Sinhala', 'Tamil', 'Arabic', 'Chinese Simplified', 'German', 'Italian', 'French', 'Spanish'];
const vehicleTypes = ['Car', 'Van', 'Bus', 'Tuk-Tuk', 'Motorcycle', 'Bicycle'];
const reservationStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'DECLINED', 'CANCELLED'];

const GuideManagement = () => {
  const [query, setQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
  const [selectedReservationStatus, setSelectedReservationStatus] = useState([]);
  const [minCapacity, setMinCapacity] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [airConditioned, setAirConditioned] = useState(null);
  const [available, setAvailable] = useState(null);
  const [verified, setVerified] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [guides, setGuides] = useState([]);
  const [facets, setFacets] = useState({});
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [topRatedCount, setTopRatedCount] = useState(0);
  const [availableVehiclesCount, setAvailableVehiclesCount] = useState(0);

  // Determine filter context
  const getFilterContext = () => {
    const hasReservationFilters = selectedReservationStatus.length > 0 || minPrice || maxPrice;
    const hasVehicleFilters = selectedVehicleTypes.length > 0 || minCapacity || maxCapacity || 
                             airConditioned !== null || available !== null;
    const hasGuideFilters = selectedRegions.length > 0 || selectedLanguages.length > 0 || 
                           verified !== null || minRating;

    if (hasReservationFilters && !hasVehicleFilters) return 'reservation';
    if (hasVehicleFilters && !hasReservationFilters) return 'vehicle';
    if (hasReservationFilters && hasVehicleFilters) return 'mixed';
    return 'guide';
  };

  const handleFilterToggle = (filter, value) => {
    const filterMap = {
      region: { current: selectedRegions, setter: setSelectedRegions },
      language: { current: selectedLanguages, setter: setSelectedLanguages },
      vehicleType: { current: selectedVehicleTypes, setter: setSelectedVehicleTypes },
      reservationStatus: { current: selectedReservationStatus, setter: setSelectedReservationStatus }
    };

    const { current, setter } = filterMap[filter];
    
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {
        query: query || '*',
        region: selectedRegions,
        language: selectedLanguages,
        vehicleType: selectedVehicleTypes,
        reservationStatus: selectedReservationStatus,
        page,
        size,
        orderBy
      };

      if (minCapacity) params.minCapacity = parseInt(minCapacity);
      if (maxCapacity) params.maxCapacity = parseInt(maxCapacity);
      if (minRating) params.minRating = parseInt(minRating);
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (airConditioned !== null) params.airConditioned = airConditioned;
      if (available !== null) params.available = available;
      if (verified !== null) params.verified = verified;

      const response = await searchGuides(params);
      setGuides(response.results || []);
      setTotalCount(response.totalCount || 0);
      setFacets(response.facets || {});
    } catch (err) {
      console.error('Search failed', err);
      setGuides([]);
      setTotalCount(0);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const statsResponse = await getGuideStats();
      setStats(statsResponse);

      const topRatedResponse = await getTopRatedGuides({ minRating: 4, size: 1 });
      setTopRatedCount(topRatedResponse.totalCount || 0);

      const availableVehiclesResponse = await getGuidesWithAvailableVehicles({ size: 1 });
      setAvailableVehiclesCount(availableVehiclesResponse.totalCount || 0);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const handleViewProfile = (guideId) => {
    window.location.href = `/users/profile/${guideId}`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearAllFilters = () => {
    setSelectedRegions([]);
    setSelectedLanguages([]);
    setSelectedVehicleTypes([]);
    setSelectedReservationStatus([]);
    setMinCapacity('');
    setMaxCapacity('');
    setMinRating('');
    setMinPrice('');
    setMaxPrice('');
    setAirConditioned(null);
    setAvailable(null);
    setVerified(null);
    setOrderBy('');
  };

  useEffect(() => {
    handleSearch();
  }, [page, selectedRegions, selectedLanguages, selectedVehicleTypes, selectedReservationStatus]);

  useEffect(() => {
    loadStats();
  }, []);

  const hasActiveFilters = selectedRegions.length > 0 || selectedLanguages.length > 0 || 
                          selectedVehicleTypes.length > 0 || selectedReservationStatus.length > 0 ||
                          minCapacity || maxCapacity || minRating || minPrice || maxPrice ||
                          airConditioned !== null || available !== null || verified !== null;

  const filterContext = getFilterContext();

  const renderGuideCard = (guide) => (
    <motion.div
      key={guide.guide_id || guide.id}
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        {/* Guide Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {guide.profile_image_url ? (
              <img
                src={guide.profile_image_url}
                alt={guide.fullName || `${guide.first_name} ${guide.last_name}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {guide.fullName || `${guide.first_name} ${guide.last_name}`}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {guide.average_rating > 0 && (
                  <div className="flex items-center">
                    <Star className={`w-4 h-4 ${getRatingColor(guide.average_rating)}`} />
                    <span className={`ml-1 text-sm ${getRatingColor(guide.average_rating)}`}>
                      {guide.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                {guide.is_verified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </div>
          {filterContext === 'reservation' && guide.reservation_status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(guide.reservation_status)}`}>
              {guide.reservation_status}
            </span>
          )}
        </div>

        {/* Context-specific Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{guide.email}</span>
          </div>
          
          {/* Guide Context */}
          {(filterContext === 'guide' || filterContext === 'mixed') && (
            <>
              {guide.contact_number && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{guide.contact_number}</span>
                </div>
              )}
              {guide.expertise_city_region && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Expert in: {guide.expertise_city_region}</span>
                </div>
              )}
              {guide.guide_language && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Languages: {guide.guide_language}</span>
                </div>
              )}
              {guide.total_reservations > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Total Tours: {guide.total_reservations}</span>
                </div>
              )}
            </>
          )}

          {/* Vehicle Context */}
          {(filterContext === 'vehicle' || filterContext === 'mixed') && guide.vehicle_type && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <Car className="w-4 h-4 mr-2" />
                <span>{guide.vehicle_type}</span>
                {guide.vehicle_capacity > 0 && (
                  <span className="ml-1">({guide.vehicle_capacity} seats)</span>
                )}
                {guide.vehicle_air_conditioned && (
                  <span className="ml-1 text-blue-600">• AC</span>
                )}
              </div>
              {guide.vehicle_model && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Model: {guide.vehicle_model}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <span className={`font-medium ${guide.vehicle_available ? 'text-green-600' : 'text-red-600'}`}>
                  {guide.vehicle_available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </>
          )}

          {/* Reservation Context */}
          {filterContext === 'reservation' && guide.reservation_id !== '0' && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Duration: {guide.number_of_days} days</span>
              </div>
              {guide.estimated_price > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Price: ${guide.estimated_price}</span>
                </div>
              )}
              {guide.reservation_places && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Places: {guide.reservation_places}</span>
                </div>
              )}
              {guide.max_travelers > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Max Travelers: {guide.max_travelers}</span>
                </div>
              )}
              {guide.reservation_dates && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Dates: {guide.reservation_dates}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Guide About */}
        {guide.guide_about && guide.guide_about !== 'none' && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{guide.guide_about}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <div>Guide ID: {guide.guide_id || guide.id}</div>
            {filterContext === 'reservation' && guide.reservation_id !== '0' && (
              <div>Reservation: {guide.reservation_id}</div>
            )}
            {filterContext === 'vehicle' && guide.vehicle_id !== '0' && (
              <div>Vehicle ID: {guide.vehicle_id}</div>
            )}
            {filterContext === 'guide' && guide.completed_reservations > 0 && (
              <div>Experience: {guide.completed_reservations} tours</div>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => handleViewProfile(guide.guide_id || guide.id)}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View Profile
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <AdminLayout currentPage="guide-management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guide Management</h1>
            <p className="text-gray-600">Search and manage tour guides across the platform</p>
          </div>
          <div className="text-sm text-gray-500">
            Total Guides: {totalCount.toLocaleString()}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Guides</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGuides}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
           
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Available Vehicles</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {availableVehiclesCount}
                  </p>
                </div>
                <Car className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Top Rated (4+ ⭐)</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {topRatedCount}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reservations</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.facets?.reservation_status?.find(item => item.includes('PENDING'))?.match(/\((\d+)\)/)?.[1] || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-96">
            <Input
              placeholder="Search guides by name, region, or language..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
              size="large"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Sort by</option>
              <option value="average_rating desc">Highest Rating</option>
              <option value="average_rating asc">Lowest Rating</option>
              <option value="completed_reservations desc">Most Experienced</option>
              <option value="estimated_price asc">Lowest Price</option>
              <option value="estimated_price desc">Highest Price</option>
            </select>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              size="large"
              type="primary"
              className="min-w-[100px]"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Search'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <Button 
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Multi-select Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Region', values: regions, key: 'region', selected: selectedRegions },
                { title: 'Language', values: languages, key: 'language', selected: selectedLanguages },
                { title: 'Vehicle Type', values: vehicleTypes, key: 'vehicleType', selected: selectedVehicleTypes },
                { title: 'Reservation Status', values: reservationStatuses, key: 'reservationStatus', selected: selectedReservationStatus }
              ].map(({ title, values, key, selected }) => (
                <div key={key}>
                  <p className="font-semibold text-gray-700 mb-3">{title}</p>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => (
                      <Button
                        key={val}
                        type={selected.includes(val) ? 'primary' : 'default'}
                        size="sm"
                        onClick={() => handleFilterToggle(key, val)}
                        className="text-xs"
                      >
                        {val}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Numeric and Boolean Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Capacity</label>
                <Input
                  type="number"
                  value={minCapacity}
                  onChange={(e) => setMinCapacity(e.target.value)}
                  placeholder="Min"
                  size="small"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
                <Input
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  placeholder="Max"
                  size="small"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  placeholder="1-5"
                  size="small"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  size="small"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  size="small"
                />
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Air Conditioned</label>
                <div className="flex gap-2">
                  <Button
                    type={airConditioned === true ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => setAirConditioned(airConditioned === true ? null : true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type={airConditioned === false ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => setAirConditioned(airConditioned === false ? null : false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available</label>
                <div className="flex gap-2">
                  <Button
                    type={available === true ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => setAvailable(available === true ? null : true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type={available === false ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => setAvailable(available === false ? null : false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verified</label>
                <div className="flex gap-2">
                  <Button
                    type={verified === true ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => setVerified(verified === true ? null : true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type={verified === false ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => setVerified(verified === false ? null : false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-2 text-gray-600">Loading guides...</span>
          </div>
        ) : (
          <>
            {guides.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No guides found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map(renderGuideCard)}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Showing {page * size + 1} to {Math.min((page + 1) * size, totalCount)} of {totalCount} guides
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-3">
                Page {page + 1} of {Math.ceil(totalCount / size)}
              </span>
              <Button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={(page + 1) * size >= totalCount}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GuideManagement;