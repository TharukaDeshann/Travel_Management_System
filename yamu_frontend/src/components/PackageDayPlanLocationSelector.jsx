import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { searchLocations } from '../services/map/locationService';
import { fetchRoute } from '../services/map/routeService';

// Configure marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PackageDayPlanLocationSelector = ({ 
  selectedLocations = [], 
  onLocationsChange, 
  onRouteChange,
  travelMode = 'driving-car',
  dayNumber 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default to Colombo, Sri Lanka

  useEffect(() => {
    if (selectedLocations.length > 0) {
      // Center map on first location
      const firstLocation = selectedLocations[0];
      setMapCenter([firstLocation.latitude, firstLocation.longitude]);
      
      // Generate route if multiple locations
      if (selectedLocations.length > 1) {
        generateRoute();
      }
    }
  }, [selectedLocations, travelMode]);

  const handleSearch = async (query) => {
    setSearchTerm(query);
    if (query.length > 2) {
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const addLocation = (result) => {
    console.log('PackageDayPlanLocationSelector - addLocation called with:', result);
    const newLocation = {
      name: result.name,
      address: result.address || result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      positionIndex: selectedLocations.length,
      placeId: result.place_id,
      notes: ''
    };

    const updatedLocations = [...selectedLocations, newLocation];
    console.log('PackageDayPlanLocationSelector - calling onLocationsChange with:', updatedLocations);
    onLocationsChange(updatedLocations);
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const removeLocation = (index) => {
    const updatedLocations = selectedLocations.filter((_, i) => i !== index);
    // Update position indices
    const reindexedLocations = updatedLocations.map((loc, idx) => ({
      ...loc,
      positionIndex: idx
    }));
    onLocationsChange(reindexedLocations);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedLocations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update position indices
    const reindexedLocations = items.map((loc, idx) => ({
      ...loc,
      positionIndex: idx
    }));

    console.log('PackageDayPlanLocationSelector - onDragEnd calling onLocationsChange with:', reindexedLocations);
    onLocationsChange(reindexedLocations);
  };

  const generateRoute = async () => {
    console.log('PackageDayPlanLocationSelector - generateRoute called with locations:', selectedLocations);
    if (selectedLocations.length < 2) {
      setRouteData(null);
      onRouteChange && onRouteChange(null);
      return;
    }

    try {
      // Convert to format expected by route service: {lon: lng, lat: lat}
      const locationCoords = selectedLocations.map(loc => ({
        lon: loc.longitude,
        lat: loc.latitude
      }));
      console.log('PackageDayPlanLocationSelector - generating route for coords:', locationCoords);
      const routeResult = await fetchRoute(locationCoords, travelMode);
      console.log('PackageDayPlanLocationSelector - route result:', routeResult);
      
      const route = {
        name: `Day ${dayNumber} Route`,
        travelMode: travelMode,
        totalDistance: routeResult.features[0].properties.summary.distance,
        estimatedTime: routeResult.features[0].properties.summary.duration,
        locations: selectedLocations
      };

      setRouteData(route);
      // Extract coordinates from GeoJSON
      const coordinates = routeResult.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert [lon, lat] to [lat, lon] for Leaflet
      setRouteCoordinates(coordinates);
      console.log('PackageDayPlanLocationSelector - calling onRouteChange with:', route);
      onRouteChange && onRouteChange(route);
    } catch (error) {
      console.error('Error generating route:', error);
      setRouteData(null);
      setRouteCoordinates([]);
      onRouteChange && onRouteChange(null);
    }
  };

  const generateRouteWithMode = async (newTravelMode) => {
    if (selectedLocations.length < 2) {
      setRouteData(null);
      onRouteChange && onRouteChange(null);
      return;
    }

    try {
      // Convert to format expected by route service: {lon: lng, lat: lat}
      const locationCoords = selectedLocations.map(loc => ({
        lon: loc.longitude,
        lat: loc.latitude
      }));
      const routeResult = await fetchRoute(locationCoords, newTravelMode);
      
      const route = {
        name: `Day ${dayNumber} Route`,
        travelMode: newTravelMode,
        totalDistance: routeResult.features[0].properties.summary.distance,
        estimatedTime: routeResult.features[0].properties.summary.duration,
        locations: selectedLocations
      };

      setRouteData(route);
      // Extract coordinates from GeoJSON
      const coordinates = routeResult.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert [lon, lat] to [lat, lon] for Leaflet
      setRouteCoordinates(coordinates);
      onRouteChange && onRouteChange(route);
    } catch (error) {
      console.error('Error generating route:', error);
      setRouteData(null);
      setRouteCoordinates([]);
      onRouteChange && onRouteChange(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Location Search */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for locations to add to day plan..."
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={travelMode}
            onChange={(e) => {
              const newTravelMode = e.target.value;
              // Update travel mode and regenerate route with new mode
              if (selectedLocations.length > 1) {
                generateRouteWithMode(newTravelMode);
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="driving-car">Driving</option>
            <option value="cycling-regular">Cycling</option>
            <option value="foot-walking">Walking</option>
          </select>
        </div>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => addLocation(result)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-medium">{result.name}</div>
                <div className="text-sm text-gray-600">{result.display_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Locations List */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Selected Locations ({selectedLocations.length})</h4>
        
        {selectedLocations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No locations selected. Search and click to add locations.</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="locations">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {selectedLocations.map((location, index) => (
                    <Draggable key={`${location.latitude}-${location.longitude}`} draggableId={`${location.latitude}-${location.longitude}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 p-3 bg-white rounded-md border ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div {...provided.dragHandleProps} className="text-gray-400 cursor-move">
                            ⋮⋮
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-600">{location.address}</div>
                          </div>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          <button
                            onClick={() => removeLocation(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Route Information */}
      {routeData && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-800">Route Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Travel Mode:</span>
              <span className="ml-2 font-medium">{routeData.travelMode}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Distance:</span>
              <span className="ml-2 font-medium">{(routeData.totalDistance / 1000).toFixed(1)} km</span>
            </div>
            <div>
              <span className="text-gray-600">Estimated Time:</span>
              <span className="ml-2 font-medium">{Math.round(routeData.estimatedTime / 60)} minutes</span>
            </div>
            <div>
              <span className="text-gray-600">Stops:</span>
              <span className="ml-2 font-medium">{selectedLocations.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Preview */}
      {selectedLocations.length > 0 && (
        <div className="h-64 rounded-lg overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {selectedLocations.map((location, index) => (
              <Marker
                key={index}
                position={[location.latitude, location.longitude]}
              >
                <Popup>
                  <div>
                    <strong>{location.name}</strong>
                    <br />
                    {location.address}
                    <br />
                    <small>Stop {index + 1}</small>
                  </div>
                </Popup>
              </Marker>
            ))}
            {/* Route visualization */}
            {routeCoordinates.length > 0 && (
              <Polyline
                positions={routeCoordinates}
                color="blue"
                weight={4}
                opacity={0.7}
              />
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default PackageDayPlanLocationSelector;
