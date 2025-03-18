import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "leaflet-routing-machine";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchOptimization } from "../services/authService";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [1, -30],
});

// Route optimization using OpenRouteService API
const RoutingMachine = ({ locations, travelMode }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 1) {
      const fetchRoute = async () => {
        try {
          const coords = locations.map((loc) => [loc.lon, loc.lat]);

          const response = await fetch(
            `https://api.openrouteservice.org/v2/directions/${travelMode}/geojson`,
            {
              method: "POST",
              headers: {
                "Authorization": "5b3ce3597851110001cf6248a4fb779cca8e41479aadb5d5d341af06",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ coordinates: coords }),
            }
          );

          const data = await response.json();

          // Remove existing route before adding the new one
          map.eachLayer((layer) => {
            if(layer.options && layer.options.className === "route-layer") {
              map.removeLayer(layer);
            }
          });

          L.geoJSON(data, { color: "blue", className: "route-layer" }).addTo(map);
          
          // Fit bounds to show the entire route
          if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      };

      fetchRoute();
    }
  }, [locations, travelMode, map]);

  return null;
};

// Map component with fit bounds control
const FitBoundsControl = ({ locations }) => {
  const map = useMap();
  
  const handleFitBounds = () => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Add a custom control to fit bounds
  useEffect(() => {
    const fitBoundsControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', '', container);
        button.innerHTML = '🔍';
        button.title = 'Fit all locations';
        button.href = '#';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.textAlign = 'center';
        button.style.fontSize = '18px';
        button.style.lineHeight = '30px';
        button.style.color = '#333';
        button.style.backgroundColor = '#fff';
        button.style.display = 'block';
        
        L.DomEvent.on(button, 'click', function(e) {
          L.DomEvent.stop(e);
          handleFitBounds();
        });
        
        return container;
      }
    });
    
    map.addControl(new fitBoundsControl());
    
    return () => {
      // Cleanup if needed
    };
  }, [map, handleFitBounds]);

  return null;
};

const Map = () => {
  const [locations, setLocations] = useState([]); // List of selected locations
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Suggestions from API
  const [travelMode, setTravelMode] = useState("driving-car");
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch locations from OpenStreetMap Nominatim API
  const handleSearch = async (query) => {
    if (query.length > 2) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
          {
            headers: {
              'User-Agent': 'YourAppName/1.0' // Add proper user agent to avoid rate limiting
            }
          }
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Add selected location to the itinerary
  const addLocation = (lat, lon, name) => {
    setLocations([...locations, { lat, lon, name }]);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Remove a location from the list
  const removeLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  // Reorder locations using drag-and-drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedLocations = Array.from(locations);
    const [movedItem] = reorderedLocations.splice(result.source.index, 1);
    reorderedLocations.splice(result.destination.index, 0, movedItem);
    setLocations(reorderedLocations);
  };
  
  // Optimize route using OpenRouteService API
  const optimizeRoute = async () => {
    if (locations.length < 3) {
      alert("Need at least 3 locations to optimize route");
      return;
    }
    
    setIsOptimizing(true);
    
    try {
      // Extract the first location as the starting point (and eventually ending point)
      const startLocation = locations[0];
      const endLocation = locations[0]; // Can be changed if you want different start/end points
      
      // Prepare locations for the API (excluding start/end)
      const waypointLocations = locations.slice(1);
      
      // Prepare data for the optimization API
      const requestBody = {
        jobs: waypointLocations.map((loc, index) => ({
          id: index + 1,
          location: [parseFloat(loc.lon), parseFloat(loc.lat)]
        })),
        vehicles: [{
          id: 1,
          profile: travelMode,
          start: [parseFloat(startLocation.lon), parseFloat(startLocation.lat)],
          end: [parseFloat(endLocation.lon), parseFloat(endLocation.lat)]
        }]
      };
      
      // Call the optimization API
      const response = await fetchOptimization({requestBody});
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // Extract the optimized order from the response
        const optimizedOrder = data.routes[0].steps.map(step => step.job || 0);
        
        // Reorder locations based on optimization result
        const optimizedLocations = [startLocation];
        
        optimizedOrder.forEach(jobId => {
          if (jobId !== 0) { // Skip the 'start' and 'end' job IDs
            optimizedLocations.push(waypointLocations[jobId - 1]);
          }
        });
        
        // Update locations with the optimized order
        setLocations(optimizedLocations);
      }
    } catch (error) {
      console.error("Error optimizing route:", error);
      
      // Fallback: Use a simple nearest neighbor algorithm if API fails
      const optimizedLocations = nearestNeighborOptimization(locations);
      setLocations(optimizedLocations);
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Fallback optimization using nearest neighbor algorithm
  const nearestNeighborOptimization = (locs) => {
    if (locs.length <= 2) return locs;
    
    const start = locs[0];
    const result = [start];
    const remaining = locs.slice(1);
    
    let current = start;
    
    while (remaining.length > 0) {
      // Find the nearest location to the current one
      let nearestIndex = 0;
      let minDistance = calculateDistance(
        current.lat, current.lon,
        remaining[0].lat, remaining[0].lon
      );
      
      for (let i = 1; i < remaining.length; i++) {
        const distance = calculateDistance(
          current.lat, current.lon,
          remaining[i].lat, remaining[i].lon
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      
      // Add the nearest location to the result
      current = remaining[nearestIndex];
      result.push(current);
      remaining.splice(nearestIndex, 1);
    }
    
    return result;
  };
  
  // Calculate haversine distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Travel Mode Selector */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>Travel Mode:</label>
        <select
          value={travelMode}
          onChange={(e) => setTravelMode(e.target.value)}
          style={{ padding: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
        >
          <option value="driving-car">🚗 Car</option>
          <option value="cycling-regular">🚴‍♂️ Cycling</option>
          <option value="foot-hiking">🥾 Hiking</option>
          <option value="foot-walking">🚶‍♂️ Walking</option>
          <option value="wheelchair">♿ Wheelchair</option>
        </select>
        
        {/* Route Optimization Button */}
        <button
          onClick={optimizeRoute}
          disabled={isOptimizing || locations.length < 3}
          style={{
            marginLeft: "20px",
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: locations.length < 3 ? "not-allowed" : "pointer",
            opacity: locations.length < 3 ? 0.6 : 1
          }}
        >
          {isOptimizing ? "Optimizing..." : "Optimize Route"}
        </button>
      </div>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search for a location..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value);
        }}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      />

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <ul style={{
          listStyle: "none",
          padding: 0,
          maxHeight: "200px",
          overflowY: "auto",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginBottom: "15px"
        }}>
          {searchResults.map((place) => (
            <li
              key={place.place_id}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #ddd",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              onClick={() => addLocation(place.lat, place.lon, place.display_name)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* Selected Locations List (with Drag & Drop) */}
      <div style={{ marginBottom: "15px" }}>
        <h3 style={{ marginBottom: "10px" }}>Itinerary</h3>
        {locations.length === 0 ? (
          <p style={{ color: "#777" }}>No locations added yet. Search and add locations above.</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="locations">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ listStyle: "none", padding: 0 }}
                >
                  {locations.map((location, index) => (
                    <Draggable key={index} draggableId={String(index)} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px",
                            background: index === 0 ? "#e6f7ff" : "#f9f9f9",
                            marginBottom: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ddd",
                            cursor: "grab",
                            ...provided.draggableProps.style
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={{ 
                              fontWeight: "bold", 
                              marginRight: "10px",
                              backgroundColor: index === 0 ? "#1890ff" : "#888",
                              color: "#fff",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "12px"
                            }}>
                              {index + 1}
                            </span>
                            <div>
                              <div style={{ fontSize: "14px", marginBottom: "3px" }}>
                                {location.name.split(",")[0]}
                              </div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {location.name.split(",").slice(1, 3).join(",")}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeLocation(index)}
                            style={{
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "5px 10px",
                              cursor: "pointer"
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={[6.9271, 79.8612]}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
        minZoom={2}
        maxZoom={18}
        worldCopyJump={true}
      >
        {/* Google Maps Tile Layer */}
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          attribution="&copy; Google Maps"
        />

        {/* Add Markers */}
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lon]}
            icon={customIcon}
          >
            <Popup>
              <strong>{index + 1}. {location.name.split(",")[0]}</strong><br />
              {location.name.split(",").slice(1).join(",")}
            </Popup>
          </Marker>
        ))}

        {/* Draw Route */}
        {locations.length > 1 && (
          <RoutingMachine locations={locations} travelMode={travelMode} />
        )}
        
        {/* Add Fit Bounds Control */}
        <FitBoundsControl locations={locations} />
      </MapContainer>
    </div>
  );
};

export default Map;