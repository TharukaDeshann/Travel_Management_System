import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Star, 
  Car, 
  User,
  DollarSign,
  Check,
  Filter
} from 'lucide-react';

const DriverSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  drivers = [], 
  selectedDriverId = null,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, rating, rate

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedRating('');
      setSelectedVehicleType('');
      setSortBy('name');
    }
  }, [isOpen]);

  // Get unique vehicle types for filter
  const vehicleTypes = useMemo(() => {
    const types = [...new Set(drivers.map(driver => driver.vehicleType))];
    return types.filter(type => type).sort();
  }, [drivers]);

  // Filter and sort drivers
  const filteredAndSortedDrivers = useMemo(() => {
    let filtered = drivers.filter(driver => {
      const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = !selectedRating || driver.rating >= parseInt(selectedRating);
      
      const matchesVehicleType = !selectedVehicleType || driver.vehicleType === selectedVehicleType;
      
      return matchesSearch && matchesRating && matchesVehicleType;
    });

    // Sort drivers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'rate':
          return a.ratePerLng - b.ratePerLng;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [drivers, searchTerm, selectedRating, selectedVehicleType, sortBy]);

  const handleDriverSelect = (driver) => {
    onSelect(driver);
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const getVehicleTypeColor = (vehicleType) => {
    const colors = {
      'Car': 'text-blue-600 bg-blue-100',
      'Van': 'text-green-600 bg-green-100',
      'Bus': 'text-purple-600 bg-purple-100',
      'SUV': 'text-orange-600 bg-orange-100',
      'Minibus': 'text-indigo-600 bg-indigo-100'
    };
    return colors[vehicleType] || 'text-gray-600 bg-gray-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-full max-w-5xl shadow-lg rounded-md bg-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Select Driver & Vehicle</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search drivers, vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* Vehicle Type Filter */}
            <div>
              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Vehicle Types</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="rate">Sort by Rate</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedDrivers.length} of {drivers.length} drivers
            </p>
          </div>
        </div>

        {/* Driver List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading drivers...</p>
            </div>
          ) : filteredAndSortedDrivers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No drivers found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedDrivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => handleDriverSelect(driver)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                    ${selectedDriverId === driver.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900 flex items-center">
                          <User className="w-5 h-5 mr-2 text-gray-400" />
                          {driver.name}
                          {selectedDriverId === driver.id && (
                            <Check className="w-5 h-5 text-blue-600 ml-2" />
                          )}
                        </h4>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${getVehicleTypeColor(driver.vehicleType)}
                        `}>
                          {driver.vehicleType}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        {renderStars(driver.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {driver.rating}/5
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {/* Vehicle Details */}
                        <div className="bg-gray-50 rounded-md p-3">
                          <h5 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                            <Car className="w-4 h-4 mr-1" />
                            Vehicle Details
                          </h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Make & Model:</span> {driver.brand} {driver.model}</p>
                            <p><span className="font-medium">License:</span> {driver.vehicleNumber}</p>
                            <p><span className="font-medium">Color:</span> {driver.color}</p>
                          </div>
                        </div>

                        {/* Rate Information */}
                        <div className="bg-blue-50 rounded-md p-3">
                          <h5 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Rate Information
                          </h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="text-lg font-medium text-blue-600">
                              {formatCurrency(driver.ratePerLng)}/km
                            </p>
                            <p className="text-xs text-gray-500">
                              Includes driver and vehicle
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Summary */}
                      <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-2">
                        <p>
                          <span className="font-medium">{driver.name}</span> will drive a 
                          <span className="font-medium"> {driver.color} {driver.brand} {driver.model}</span> 
                          ({driver.vehicleNumber}) at <span className="font-medium">{formatCurrency(driver.ratePerLng)}/km</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverSelectorModal;
