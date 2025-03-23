import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { searchLocations, calculateDistance, saveRoute } from "../services/map/locationService";
import { fetchRoute, optimizeRoute, nearestNeighborOptimization } from "../services/map/routeService";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [1, -30],
});

// Route display component
const RoutingMachine = ({ locations, travelMode }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 1) {
      const drawRoute = async () => {
        try {
          const data = await fetchRoute(locations, travelMode);

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
          console.error("Error drawing route:", error);
        }
      };

      drawRoute();
    }
  }, [locations, travelMode, map]);

  return null;
};

// Map component with fit bounds control
const FitBoundsControl = ({ locations }) => {
  const map = useMap();
  
  useEffect(() => {
    // Moved handleFitBounds inside the useEffect
    const handleFitBounds = () => {
      if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

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
  }, [map, locations]); // Only depends on map and locations now

  return null;
};

const Map = () => {
  const [locations, setLocations] = useState([]); // List of selected locations
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Suggestions from API
  const [travelMode, setTravelMode] = useState("driving-car");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] =  useState(false);

  
  // Handle location search
  const handleSearch = async (query) => {
    if (query.length > 2) {
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSearchResults([]);
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
  
  // Handle route optimization
  const handleOptimizeRoute = async () => {
    if (locations.length < 3) {
      alert("Need at least 3 locations to optimize route");
      return;
    }
    
    setIsOptimizing(true);
    
    try {
      // Try to optimize route with API
      const optimizedLocations = await optimizeRoute(locations, travelMode);
      setLocations(optimizedLocations);
    } catch (error) {
      console.error("Error optimizing route:", error);
      
      // Fallback to nearest neighbor if API fails
      const optimizedLocations = nearestNeighborOptimization(locations, calculateDistance);
      setLocations(optimizedLocations);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle saving the route
  const handleSaveRoute = async () => {
    try {
      setIsSaving(true);
      
      // Prepare route data for saving
      const routeData = {
        name : "My Route",
        travelMode : travelMode,
        totalDistance : null,
        estimatedTime : null,
        locations : locations.map((loc, index) => ({
          name : loc.name.split(",")[0], // Extract only the first part of the name
          address : loc.name,
          latitude : loc.lat,
          longitude : loc.lon,
          positionIndex : index,
          placeId : loc.place_id || "",
          notes : ""
        }))
      };

      // save route 
      const savedRoute = await saveRoute(routeData);
      alert(`Route "${savedRoute.name}" saved successfully!`);
    }
    catch (error) {
      console.error("Error saving route:", error);
      alert("Error saving route. Please try again.");
    }
    finally {
      setIsSaving(false);
    }
  }

  

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
          onClick={handleOptimizeRoute}
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

        <button
          onClick={handleSaveRoute}
          disabled={locations.length < 1}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            backgroundColor: "#1976D2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: locations.length < 1 ? "not-allowed" : "pointer",
            opacity: locations.length < 1 ? 0.6 : 1
          }}
        >
          {isSaving ? "Saving..." : "Save"}
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