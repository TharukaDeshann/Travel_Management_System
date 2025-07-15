import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
import '../styles/DirectionsPage.css';

// Fix default marker icons
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const RoutingMachine = ({ from, to, onRouteError, onRoutesFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !map) return;

    // Remove any existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lon), L.latLng(to.lat, to.lon)],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: { styles: [{ color: "#6FA1EC", weight: 4 }] },
      show: true, // Show the instructions panel
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      routeWhileDragging: false,
      collapsible: false, // Keep panel always visible
      instructionsContainer: document.createElement('div') // Create new container
    }).addTo(map);

    routingControlRef.current = routingControl;

    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      onRoutesFound?.(routes);
    });

    routingControl.on('routingerror', (err) => {
      onRouteError?.('Failed to calculate route');
    });

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [from, to, map]);

  return null;
};

const DirectionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeError, setRouteError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startLocationInput, setStartLocationInput] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const autocompleteRef = useRef(null);

  const { currentLocation: initialCurrentLocation, destination, initialLocation, placeName } = location.state || {};

  const geocodePlace = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.filter(result => 
        result.lat && result.lon && 
        !isNaN(parseFloat(result.lat)) && 
        !isNaN(parseFloat(result.lon))
      );
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const fetchAutocomplete = async (query) => {
    if (!query || query.length < 3) {
      setAutocompleteResults([]);
      return;
    }

    try {
      const results = await geocodePlace(query);
      if (results && results.length > 0) {
        setAutocompleteResults(results.slice(0, 5));
      } else {
        setAutocompleteResults([]);
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
      setAutocompleteResults([]);
    }
  };

  const handleAutocompleteSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    if (isNaN(lat) || isNaN(lon)) {
      setRouteError('Invalid location coordinates');
      return;
    }
    
    setStartLocationInput(result.display_name);
    setCurrentLocation({ lat, lon, name: result.display_name });
    setShowAutocomplete(false);
  };

  const fetchLocationData = async () => {
    try {
      if (placeName && (!destination || !destination.lat)) {
        const searchVariations = [
          `${placeName}, Sri Lanka`,
          placeName,
          placeName.replace(/(Rock|Fortress|Temple)/gi, '').trim(),
          placeName.split(',')[0],
          placeName.split(' ')[0]
        ].filter((value, index, self) => value && self.indexOf(value) === index);

        let geocodingResults = [];
        
        for (const query of searchVariations) {
          const results = await geocodePlace(query);
          if (results && results.length > 0) {
            geocodingResults = results;
            break;
          }
        }

        if (geocodingResults.length > 0) {
          const firstResult = geocodingResults[0];
          setDestinationCoords({
            lat: parseFloat(firstResult.lat),
            lon: parseFloat(firstResult.lon),
            name: placeName
          });
        } else {
          throw new Error('Location not found');
        }
      } else if (destination) {
        setDestinationCoords(destination);
      } else if (initialLocation) {
        setDestinationCoords(initialLocation);
      }

      if (!initialCurrentLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            setStartLocationInput("My Current Location");
          },
          (error) => {
            console.error("Geolocation error:", error);
            setIsLoading(false);
          }
        );
      } else if (initialCurrentLocation) {
        setCurrentLocation(initialCurrentLocation);
        setStartLocationInput("My Current Location");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Location data error:", error);
      setRouteError("Could not find the specified location. Please try again.");
      setIsLoading(false);
    }
  };

  const calculateRoute = () => {
    if (!startLocationInput || !destinationCoords) {
      setRouteError("Please select a starting location");
      return;
    }
    setIsCalculatingRoute(true);
    setRouteCalculated(true);
    setAvailableRoutes([]);
  };

  const handleRoutesFound = (routes) => {
    setAvailableRoutes(routes);
    setIsCalculatingRoute(false);
    setRouteError(null);
  };

  useEffect(() => {
    if (!destination && !initialLocation && !placeName) {
      navigate(-1);
      return;
    }

    fetchLocationData();

    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAutocomplete(startLocationInput);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [startLocationInput]);

  const defaultCenter = [7.8731, 80.7718];
  const center = destinationCoords 
    ? [destinationCoords.lat, destinationCoords.lon] 
    : defaultCenter;

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading directions...</p>
      </div>
    );
  }

  return (
    <div className="directions-page-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      
      {routeError && (
        <div className="error-banner">
          <div className="error-message">{routeError}</div>
          <div className="error-suggestions">
            <p>Suggestions:</p>
            <ul>
              <li>Try searching for a more specific location</li>
              <li>Check your internet connection</li>
              <li>Try again in a few moments</li>
            </ul>
          </div>
          <button className="retry-button" onClick={calculateRoute}>
            Retry
          </button>
        </div>
      )}

      <div className="route-controls">
        <div className="location-input-container" ref={autocompleteRef}>
          <input
            type="text"
            value={startLocationInput}
            onChange={(e) => {
              setStartLocationInput(e.target.value);
              setShowAutocomplete(true);
            }}
            onFocus={() => setShowAutocomplete(true)}
            placeholder="Enter starting location"
            className="location-input"
          />
          {showAutocomplete && autocompleteResults.length > 0 && (
            <div className="autocomplete-dropdown">
              {autocompleteResults.map((result, index) => (
                <div
                  key={index}
                  className="autocomplete-item"
                  onClick={() => handleAutocompleteSelect(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        <button 
          className="find-route-button"
          onClick={calculateRoute}
          disabled={isCalculatingRoute}
        >
          {isCalculatingRoute ? (
            <>
              <span className="button-spinner"></span>
              Calculating...
            </>
          ) : (
            "Find Route"
          )}
        </button>
      </div>
      
      <MapContainer 
        key={`${center[0]}-${center[1]}-${routeCalculated}`}
        center={center} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapReady && destinationCoords && (
          <Marker position={[destinationCoords.lat, destinationCoords.lon]}>
            <Popup>{destinationCoords.name || "Destination"}</Popup>
          </Marker>
        )}

        {mapReady && routeCalculated && currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lon]}>
            <Popup>Starting Point</Popup>
          </Marker>
        )}

        {mapReady && routeCalculated && currentLocation && destinationCoords && (
          <RoutingMachine 
            from={currentLocation} 
            to={destinationCoords} 
            onRouteError={setRouteError}
            onRoutesFound={handleRoutesFound}
          />
        )}
      </MapContainer>

      {availableRoutes.length > 0 && (
  <div className="route-info-panel">
    <div className="route-summary">
      <h4>Route Summary</h4>
      <p><strong>Distance:</strong> {(availableRoutes[0].summary.totalDistance / 1000).toFixed(1)} km</p>
      <p><strong>Estimated Time:</strong> {Math.floor(availableRoutes[0].summary.totalTime / 3600)} hours {Math.round((availableRoutes[0].summary.totalTime % 3600) / 60)} minutes</p>
    </div>
  </div>
)}
    </div>
  );
};

export default DirectionsPage;