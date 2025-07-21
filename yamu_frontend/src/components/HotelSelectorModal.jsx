import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Star, 
  MapPin, 
  DollarSign,
  Filter,
  Check
} from 'lucide-react';

const HotelSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  hotels = [], 
  selectedHotelId = null,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedPriceLevel, setSelectedPriceLevel] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, rating, priceLevel

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedRating('');
      setSelectedPriceLevel('');
      setSortBy('name');
    }
  }, [isOpen]);

  // Filter and sort hotels
  const filteredAndSortedHotels = useMemo(() => {
    let filtered = hotels.filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hotel.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = !selectedRating || hotel.rating >= parseInt(selectedRating);
      
      const matchesPriceLevel = !selectedPriceLevel || hotel.priceLevel === parseInt(selectedPriceLevel);
      
      return matchesSearch && matchesRating && matchesPriceLevel;
    });

    // Sort hotels
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'priceLevel':
          return a.priceLevel - b.priceLevel;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [hotels, searchTerm, selectedRating, selectedPriceLevel, sortBy]);

  const handleHotelSelect = (hotel) => {
    onSelect(hotel);
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

  const getPriceLevelText = (level) => {
    switch (level) {
      case 1: return 'Budget';
      case 2: return 'Mid-range';
      case 3: return 'Luxury';
      default: return 'Unknown';
    }
  };

  const getPriceLevelColor = (level) => {
    switch (level) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-yellow-600 bg-yellow-100';
      case 3: return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-full max-w-4xl shadow-lg rounded-md bg-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Select Hotel</h3>
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
                placeholder="Search hotels..."
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

            {/* Price Level Filter */}
            <div>
              <select
                value={selectedPriceLevel}
                onChange={(e) => setSelectedPriceLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Price Levels</option>
                <option value="1">Budget</option>
                <option value="2">Mid-range</option>
                <option value="3">Luxury</option>
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
                <option value="priceLevel">Sort by Price Level</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedHotels.length} of {hotels.length} hotels
            </p>
          </div>
        </div>

        {/* Hotel List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading hotels...</p>
            </div>
          ) : filteredAndSortedHotels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hotels found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  onClick={() => handleHotelSelect(hotel)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                    ${selectedHotelId === hotel.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {hotel.name}
                          {selectedHotelId === hotel.id && (
                            <Check className="inline w-5 h-5 text-blue-600 ml-2" />
                          )}
                        </h4>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${getPriceLevelColor(hotel.priceLevel)}
                        `}>
                          {getPriceLevelText(hotel.priceLevel)}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{hotel.address}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {renderStars(hotel.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            {hotel.rating}/5
                          </span>
                        </div>
                        
                        {hotel.pricePerNight && (
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {formatCurrency(hotel.pricePerNight)}/night
                          </div>
                        )}
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

export default HotelSelectorModal;
