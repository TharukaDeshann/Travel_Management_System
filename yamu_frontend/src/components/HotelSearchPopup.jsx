import React, { useState, useEffect } from 'react';
import { searchHotelsAlongRoute } from '../services/hotelService';
import HotelCard from './HotelCard';

const HotelSearchPopup = ({ isOpen, onClose, locations, selectedDate, onHotelSelect }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    radius: 2000,
    minRating: 1.0,
    maxResults: 10
  });

  useEffect(() => {
    if (isOpen && locations.length > 0) {
      searchHotels();
    }
  }, [isOpen, locations]);

  const searchHotels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Searching hotels for locations:', locations);
      const hotelsData = await searchHotelsAlongRoute(
        locations, 
        searchParams.radius, 
        searchParams.minRating, 
        searchParams.maxResults
      );
      
      setHotels(hotelsData);
      console.log('🏨 Hotels loaded:', hotelsData.length);
    } catch (err) {
      console.error('❌ Hotel search failed:', err);
      setError('Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (key, value) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    searchHotels();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Book Hotel</h2>
            <p className="text-blue-100">Date: {selectedDate}</p>
            <p className="text-blue-100">{locations.length} stops in your route</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Search Parameters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">Search Radius</label>
              <select 
                value={searchParams.radius}
                onChange={(e) => handleParamChange('radius', parseInt(e.target.value))}
                className="px-3 py-1 border rounded"
              >
                <option value={1000}>1 km</option>
                <option value={2000}>2 km</option>
                <option value={3000}>3 km</option>
                <option value={5000}>5 km</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min Rating</label>
              <select 
                value={searchParams.minRating}
                onChange={(e) => handleParamChange('minRating', parseFloat(e.target.value))}
                className="px-3 py-1 border rounded"
              >
                <option value={1.0}>1+ Stars</option>
                <option value={2.0}>2+ Stars</option>
                <option value={3.0}>3+ Stars</option>
                <option value={4.0}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Results</label>
              <select 
                value={searchParams.maxResults}
                onChange={(e) => handleParamChange('maxResults', parseInt(e.target.value))}
                className="px-3 py-1 border rounded"
              >
                <option value={5}>5 Hotels</option>
                <option value={10}>10 Hotels</option>
                <option value={15}>15 Hotels</option>
                <option value={20}>20 Hotels</option>
              </select>
            </div>

            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '🔍 Searching...' : '🔍 Search Hotels'}
            </button>
          </div>
        </div>

        {/* Hotels List */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '60vh' }}>
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Searching for hotels...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 text-lg">❌ {error}</div>
              <button 
                onClick={handleSearch}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && hotels.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-600 text-lg">🏨 No hotels found</div>
              <p className="text-sm text-gray-500 mt-2">Try adjusting search parameters</p>
            </div>
          )}

          {!loading && !error && hotels.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Found {hotels.length} hotels near your route
              </div>
              
              {hotels.map((hotel, index) => (
                <HotelCard 
                  key={hotel.id || index}
                  hotel={hotel}
                  onSelect={() => onHotelSelect(hotel)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            🗺️ Hotels are searched along your planned route using OpenStreetMap data
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchPopup;
