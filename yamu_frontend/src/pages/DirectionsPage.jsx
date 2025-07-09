import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
import '../styles/DirectionsPage.css';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const RoutingMachine = ({ from, to, onRouteError }) => {
  const map = useMap();

  useEffect(() => {
    if (!from || !to || !from.lat || !from.lon || !to.lat || !to.lon) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lon), L.latLng(to.lat, to.lon)],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: { styles: [{ color: "#6FA1EC", weight: 4 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      routeWhileDragging: false,
    }).addTo(map);

    routingControl.on('routingerror', (err) => {
      onRouteError?.('Failed to calculate route');
    });

    return () => {
      map.removeControl(routingControl);
    };
  }, [from, to, map, onRouteError]);

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
  const autocompleteRef = useRef(null);

  const { currentLocation: initialCurrentLocation, destination, initialLocation, placeName } = location.state || {};

  const geocodePlace = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      return await response.json();
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
    setStartLocationInput(result.display_name);
    setCurrentLocation({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name: result.display_name
    });
    setShowAutocomplete(false);
  };

  const fetchLocationData = async () => {
    try {
      console.log('Received in DirectionsPage:', {
        initialCurrentLocation,
        destination,
        initialLocation,
        placeName
      });

      if (placeName && (!destination || !destination.lat)) {
        const searchVariations = [
          `${placeName}, Sri Lanka`,
          placeName,
          placeName.replace(/(Rock|Fortress|Temple)/gi, '').trim(),
          placeName.split(',')[0],
          placeName.split(' ')[0]
        ].filter((value, index, self) => 
          value && self.indexOf(value) === index
        );

        console.log('Trying search variations:', searchVariations);

        let geocodingResults = [];
        
        for (const query of searchVariations) {
          console.log('Attempting to geocode:', query);
          const results = await geocodePlace(query);
          if (results && results.length > 0) {
            geocodingResults = results;
            break;
          }
        }

        console.log('Geocoding results:', geocodingResults);

        if (geocodingResults.length > 0) {
          const firstResult = geocodingResults[0];
          console.log('Using geocoding result:', {
            lat: firstResult.lat,
            lon: firstResult.lon,
            name: placeName
          });
          setDestinationCoords({
            lat: parseFloat(firstResult.lat),
            lon: parseFloat(firstResult.lon),
            name: placeName
          });
        } else {
          console.error('No geocoding results found for any variation');
          throw new Error('Location not found');
        }
      } else if (destination) {
        console.log('Using provided destination coordinates:', destination);
        setDestinationCoords(destination);
      } else if (initialLocation) {
        console.log('Using provided initial location coordinates:', initialLocation);
        setDestinationCoords(initialLocation);
      }

      if (!initialCurrentLocation && navigator.geolocation) {
        console.log('Attempting to get current location...');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Got current location:', {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            const newLocation = {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            };
            setCurrentLocation(newLocation);
            setStartLocationInput("My Current Location");
          },
          (error) => {
            console.error("Error getting current location:", error);
            setIsLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else if (initialCurrentLocation) {
        console.log('Using provided current location:', initialCurrentLocation);
        setCurrentLocation(initialCurrentLocation);
        setStartLocationInput("My Current Location");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchLocationData:", {
        error: error.message,
        state: {
          destination,
          initialLocation,
          placeName
        }
      });
      setRouteError("Could not find the specified location. Please try again.");
      setIsLoading(false);
    }
  };

  const calculateRoute = () => {
    if (!startLocationInput || !destinationCoords) {
      setRouteError("Please select a starting location");
      return;
    }
    setRouteCalculated(true);
  };

  useEffect(() => {
    if (!destination && !initialLocation && !placeName) {
      alert("No location information provided. Redirecting back...");
      navigate(-1);
      return;
    }

    fetchLocationData();

    // Handle clicks outside autocomplete dropdown
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [destination, initialLocation, placeName, initialCurrentLocation, navigate]);

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
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      
      {routeError && (
        <div className="error-banner">
          <div className="error-message">{routeError}</div>
          <div className="error-suggestions">
            <p>Suggestions:</p>
            <ul>
              <li>Try searching for a more specific location</li>
              <li>Check your spelling</li>
              <li>Try a nearby landmark instead</li>
              <li>Use the full address if possible</li>
            </ul>
          </div>
          <button 
            className="retry-button"
            onClick={() => fetchLocationData()}
          >
            Retry
          </button>
          <button 
            className="dismiss-button"
            onClick={() => setRouteError(null)}
          >
            Dismiss
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
        >
          Find Route
        </button>
      </div>
      
      {!isLoading && (
        <MapContainer 
          key={`${center[0]}-${center[1]}`}
          center={center} 
          zoom={13} 
          scrollWheelZoom 
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
              onRouteError={(msg) => setRouteError(msg)}
            />
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default DirectionsPage;