import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { searchLocations } from "../services/map/locationService";
import { fetchRoute } from "../services/map/routeService";

// Marker icon configuration
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for pickup location
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for dropoff location
const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect, locationType }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      // Reverse geocoding to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              'User-Agent': 'YourAppName/1.0'
            }
          }
        );
        const data = await response.json();
        
        onLocationSelect({
          name: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng
        }, locationType);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        onLocationSelect({
          name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng
        }, locationType);
      }
    }
  });
  
  return null;
};

// Component to draw route on map
const RouteDisplay = ({ pickupLocation, dropoffLocation, onRouteInfo }) => {
  const map = useMap();

  useEffect(() => {
    if (pickupLocation.latitude && pickupLocation.longitude && 
        dropoffLocation.latitude && dropoffLocation.longitude) {
      
      const drawRoute = async () => {
        try {
          const locations = [
            { lat: pickupLocation.latitude, lon: pickupLocation.longitude },
            { lat: dropoffLocation.latitude, lon: dropoffLocation.longitude }
          ];
          
          const routeData = await fetchRoute(locations, 'driving-car');
          
          // Remove existing route layers
          map.eachLayer((layer) => {
            if (layer.options?.className === "location-selector-route") {
              map.removeLayer(layer);
            }
          });

          // Add new route
          L.geoJSON(routeData, {
            color: "#2563eb",
            weight: 4,
            className: "location-selector-route",
            opacity: 0.8
          }).addTo(map);

          // Extract route information
          if (routeData && routeData.features && routeData.features[0]) {
            const route = routeData.features[0];
            const distance = route.properties?.summary?.distance || 0;
            const duration = route.properties?.summary?.duration || 0;
            
            onRouteInfo({
              distance: Math.round(distance / 1000 * 10) / 10, // Convert to km
              duration: Math.round(duration / 60) // Convert to minutes
            });
          }

          // Fit bounds to show both locations and route
          const bounds = L.latLngBounds([
            [pickupLocation.latitude, pickupLocation.longitude],
            [dropoffLocation.latitude, dropoffLocation.longitude]
          ]);
          map.fitBounds(bounds, { padding: [20, 20] });

        } catch (error) {
          console.error("Error drawing route:", error);
          onRouteInfo(null);
        }
      };

      drawRoute();
    } else {
      // Remove route if either location is missing
      map.eachLayer((layer) => {
        if (layer.options?.className === "location-selector-route") {
          map.removeLayer(layer);
        }
      });
      onRouteInfo(null);
    }
  }, [pickupLocation, dropoffLocation, map, onRouteInfo]);

  return null;
};

const LocationSelector = ({ 
  pickupLocation, 
  dropoffLocation, 
  onLocationChange, 
  title = "Select Locations",
  height = "400px",
  compact = false, // New prop for compact mode
  showDemo = false // New prop to show/hide demo locations
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeLocationType, setActiveLocationType] = useState(null); // 'pickup' or 'dropoff'
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default to Colombo, Sri Lanka
  const [searchLoading, setSearchLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null); // Store route distance and duration

  // Demo locations for quick testing
  const demoLocations = [
    { name: "Bandaranaike International Airport, Katunayake", latitude: 7.1804, longitude: 79.8840 },
    { name: "Galle Face Green, Colombo", latitude: 6.9271, longitude: 79.8460 },
    { name: "Temple of the Sacred Tooth Relic, Kandy", latitude: 7.2939, longitude: 80.6421 },
    { name: "Sigiriya Lion Rock", latitude: 7.9568, longitude: 80.7598 },
    { name: "Mirissa Beach", latitude: 5.9463, longitude: 80.4540 }
  ];

  // Get user's current location for map center
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default center if geolocation fails
        }
      );
    }
  }, []);

  const handleSearch = async (query) => {
    if (query.length > 2) {
      setSearchLoading(true);
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchLoading(false);
    }
  };

  const handleLocationSelect = (location, locationType) => {
    const locationData = {
      name: location.name || location.display_name,
      latitude: parseFloat(location.lat || location.latitude),
      longitude: parseFloat(location.lon || location.longitude)
    };

    onLocationChange(locationData, locationType);
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    setActiveLocationType(null);
  };

  const handleSearchResultClick = (place) => {
    if (activeLocationType) {
      handleLocationSelect(place, activeLocationType);
    }
  };

  const handleLocationInputClick = (locationType) => {
    setActiveLocationType(locationType);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleSearchInputChange = (value, locationType) => {
    setSearchTerm(value);
    setActiveLocationType(locationType);
    handleSearch(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      setShowSearchResults(false);
      setActiveLocationType(null);
    }
  };

  const clearLocation = (locationType) => {
    onLocationChange({ name: '', latitude: 0, longitude: 0 }, locationType);
  };

  // Demo location selection handler
  const handleDemoLocationSelect = (location, locationType) => {
    onLocationChange(location, locationType);
  };

  const useCurrentLocation = (locationType) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              {
                headers: {
                  'User-Agent': 'YourAppName/1.0'
                }
              }
            );
            const data = await response.json();
            
            onLocationChange({
              name: data.display_name || `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
              latitude,
              longitude
            }, locationType);
          } catch (error) {
            console.error('Error getting address:', error);
            onLocationChange({
              name: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
              latitude,
              longitude
            }, locationType);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your current location. Please ensure location access is enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Type location names for suggestions, use demo locations, or click directly on the map
        </p>
      </div>

      <div className="p-4">
        {/* Demo Locations (for testing) */}
        {showDemo && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-900">Quick Demo Locations</h4>
              <span className="text-xs text-blue-600">Click to use popular places</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoLocations.map((location, index) => (
                <div key={index} className="flex gap-1">
                  <button
                    onClick={() => handleDemoLocationSelect(location, 'pickup')}
                    className="flex-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    title="Set as pickup"
                  >
                    🟢 {location.name.split(',')[0]}
                  </button>
                  <button
                    onClick={() => handleDemoLocationSelect(location, 'dropoff')}
                    className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    title="Set as drop-off"
                  >
                    🔴 {location.name.split(',')[0]}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Input Fields */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 ${compact ? 'hidden' : ''}`}>
          {/* Pickup Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🟢 Pick-up Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={activeLocationType === 'pickup' ? searchTerm : pickupLocation.name}
                onChange={(e) => handleSearchInputChange(e.target.value, 'pickup')}
                onFocus={() => handleLocationInputClick('pickup')}
                onKeyDown={handleKeyDown}
                placeholder="Type to search pickup location..."
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchLoading && activeLocationType === 'pickup' && (
                <div className="absolute right-8 top-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                </div>
              )}
              {pickupLocation.name && (
                <button
                  onClick={() => clearLocation('pickup')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => useCurrentLocation('pickup')}
              className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
            >
              📍 Use Current Location
            </button>
          </div>

          {/* Dropoff Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔴 Drop-off Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={activeLocationType === 'dropoff' ? searchTerm : dropoffLocation.name}
                onChange={(e) => handleSearchInputChange(e.target.value, 'dropoff')}
                onFocus={() => handleLocationInputClick('dropoff')}
                onKeyDown={handleKeyDown}
                placeholder="Type to search drop-off location..."
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {searchLoading && activeLocationType === 'dropoff' && (
                <div className="absolute right-8 top-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                </div>
              )}
              {dropoffLocation.name && (
                <button
                  onClick={() => clearLocation('dropoff')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && activeLocationType && (
          <div className="relative mb-4">
            <div className="absolute z-[1010] w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <p className="text-sm text-gray-600 mt-2">Searching locations...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b text-xs text-gray-600 font-medium">
                    {activeLocationType === 'pickup' ? '🟢 Select Pickup Location' : '🔴 Select Drop-off Location'}
                  </div>
                  {searchResults.slice(0, 10).map((place, index) => (
                    <div
                      key={place.place_id || index}
                      onClick={() => handleSearchResultClick(place)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`text-sm mt-1 ${
                          activeLocationType === 'pickup' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          📍
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {place.display_name.split(",")[0]}
                          </div>
                          <div className="text-sm text-gray-500">
                            {place.display_name.split(",").slice(1, 4).join(", ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 10 && (
                    <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                      Showing first 10 results. Type more to refine search.
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center">
                  <div className="text-gray-400 text-2xl mb-2">🔍</div>
                  <div className="text-gray-500">No locations found</div>
                  <div className="text-xs text-gray-400 mt-1">Try different keywords</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {activeLocationType && (
          <div className={`mb-4 p-3 rounded-lg ${
            activeLocationType === 'pickup' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-sm font-medium ${
              activeLocationType === 'pickup' ? 'text-green-800' : 'text-red-800'
            }`}>
              {activeLocationType === 'pickup' 
                ? '🟢 Selecting Pick-up Location' 
                : '🔴 Selecting Drop-off Location'
              }
            </div>
            <div className={`text-xs mt-1 ${
              activeLocationType === 'pickup' ? 'text-green-600' : 'text-red-600'
            }`}>
              Click anywhere on the map to set the location, or search above
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="rounded-lg overflow-hidden border border-gray-300 relative z-[1000]" style={{ height }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 1000 }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            
            {/* Map click handler */}
            {activeLocationType && (
              <MapClickHandler 
                onLocationSelect={handleLocationSelect}
                locationType={activeLocationType}
              />
            )}

            {/* Route display */}
            <RouteDisplay 
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              onRouteInfo={setRouteInfo}
            />
            
            {/* Pickup location marker */}
            {pickupLocation.latitude && pickupLocation.longitude && (
              <Marker 
                position={[pickupLocation.latitude, pickupLocation.longitude]}
                icon={pickupIcon}
              />
            )}
            
            {/* Dropoff location marker */}
            {dropoffLocation.latitude && dropoffLocation.longitude && (
              <Marker 
                position={[dropoffLocation.latitude, dropoffLocation.longitude]}
                icon={dropoffIcon}
              />
            )}
          </MapContainer>
        </div>

        {/* Demo Locations (if enabled) */}
        {showDemo && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Locations:</h4>
            <div className="grid grid-cols-2 gap-2">
              {demoLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLocationSelect(location, 'pickup')}
                  className="flex items-center p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <span className="text-green-600 mr-2">🟢</span>
                  <span className="text-sm font-medium">{location.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location Summary */}
        {(pickupLocation.name || dropoffLocation.name) && (
          <div className="mt-4 bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Locations:</h4>
            <div className="space-y-2 text-sm">
              {pickupLocation.name && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">🟢</span>
                  <div>
                    <div className="font-medium">Pick-up:</div>
                    <div className="text-gray-600">{pickupLocation.name}</div>
                  </div>
                </div>
              )}
              {dropoffLocation.name && (
                <div className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">🔴</span>
                  <div>
                    <div className="font-medium">Drop-off:</div>
                    <div className="text-gray-600">{dropoffLocation.name}</div>
                  </div>
                </div>
              )}
              
              {/* Route Information */}
              {routeInfo && pickupLocation.name && dropoffLocation.name && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-600">📏</span>
                      <span className="font-medium">Distance:</span>
                      <span className="text-blue-600 font-semibold">{routeInfo.distance} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-orange-600">⏱️</span>
                      <span className="font-medium">Est. Time:</span>
                      <span className="text-orange-600 font-semibold">
                        {routeInfo.duration < 60 
                          ? `${routeInfo.duration} min` 
                          : `${Math.floor(routeInfo.duration / 60)}h ${routeInfo.duration % 60}m`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
