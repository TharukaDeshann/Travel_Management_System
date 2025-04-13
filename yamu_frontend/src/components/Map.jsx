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

          L.geoJSON(data, { 
            color: "#2563eb", 
            weight: 5,
            opacity: 0.8,
            className: "route-layer",
            dashArray: travelMode.includes("foot") ? "5, 10" : null
          }).addTo(map);
          
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
        button.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';
        button.style.display = 'block';
        button.style.transition = 'all 0.3s ease';
        
        button.onmouseover = function() {
          this.style.backgroundColor = '#f0f0f0';
        };
        
        button.onmouseout = function() {
          this.style.backgroundColor = '#fff';
        };
        
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
  }, [map, locations]);

  return null;
};

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [travelMode, setTravelMode] = useState("driving-car");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Handle location search
  const handleSearch = async (query) => {
    if (query.length > 2) {
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Add selected location to the itinerary
  const addLocation = (lat, lon, name) => {
    console.log("Adding location:", { lat, lon, name });
    setLocations([...locations, { lat, lon, name }]);
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchResults(false);
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
        name: "My Route",
        travelMode: travelMode,
        totalDistance: null,
        estimatedTime: null,
        locations: locations.map((loc, index) => ({
          name: loc.name.split(",")[0], // Extract only the first part of the name
          address: loc.name,
          latitude: loc.lat,
          longitude: loc.lon,
          positionIndex: index,
          placeId: loc.place_id || "",
          notes: ""
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

  const travelModeIcons = {
    "driving-car": "🚗",
    "cycling-regular": "🚴‍♂️",
    "foot-hiking": "🥾",
    "foot-walking": "🚶‍♂️",
    "wheelchair": "♿"
  };

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundColor: "#f8fafc",
      borderRadius: "10px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ 
          color: "#1e40af", 
          borderBottom: "2px solid #3b82f6",
          paddingBottom: "8px",
          marginBottom: "20px"
        }}>
          Interactive Route Planner
        </h2>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            backgroundColor: "#fff",
            padding: "10px 15px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
          }}>
            <label style={{ fontWeight: "600", marginRight: "10px", color: "#4b5563" }}>Travel Mode:</label>
            <select
              value={travelMode}
              onChange={(e) => setTravelMode(e.target.value)}
              style={{ 
                padding: "8px 12px", 
                border: "1px solid #d1d5db", 
                borderRadius: "6px",
                backgroundColor: "#f9fafb",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              <option value="driving-car">🚗 Car</option>
              <option value="cycling-regular">🚴‍♂️ Cycling</option>
              <option value="foot-hiking">🥾 Hiking</option>
              <option value="foot-walking">🚶‍♂️ Walking</option>
              <option value="wheelchair">♿ Wheelchair</option>
            </select>
          </div>
          
          <button
            onClick={handleOptimizeRoute}
            disabled={isOptimizing || locations.length < 3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 16px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: locations.length < 3 ? "not-allowed" : "pointer",
              opacity: locations.length < 3 ? 0.6 : 1,
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              fontWeight: "500"
            }}
            onMouseOver={(e) => {
              if (locations.length >= 3) e.currentTarget.style.backgroundColor = "#059669";
            }}
            onMouseOut={(e) => {
              if (locations.length >= 3) e.currentTarget.style.backgroundColor = "#10b981";
            }}
          >
            <span style={{ marginRight: "5px" }}>⚡</span>
            {isOptimizing ? "Optimizing..." : "Optimize Route"}
          </button>

          <button
            onClick={handleSaveRoute}
            disabled={isSaving || locations.length < 1}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: locations.length < 1 ? "not-allowed" : "pointer",
              opacity: locations.length < 1 ? 0.6 : 1,
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              fontWeight: "500"
            }}
            onMouseOver={(e) => {
              if (locations.length >= 1) e.currentTarget.style.backgroundColor = "#2563eb";
            }}
            onMouseOut={(e) => {
              if (locations.length >= 1) e.currentTarget.style.backgroundColor = "#3b82f6";
            }}
          >
            <span style={{ marginRight: "5px" }}>💾</span>
            {isSaving ? "Saving..." : "Save Route"}
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: "15px" }}>
          <div style={{ position: "relative" }}>
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
                padding: "12px 12px 12px 40px",
                fontSize: "15px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                backgroundColor: "#fff"
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSearchResults(false), 1000);
              }}
            />
            <div style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "#6b7280",
              fontSize: "18px"
            }}>
              🔍
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <ul style={{
              position: "absolute",
              zIndex: 1000,
              width: "100%",
              listStyle: "none",
              padding: 0,
              maxHeight: "250px",
              overflowY: "auto",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              marginTop: "5px"
            }}>
              {searchResults.map((place) => (
                <li
                  key={place.place_id}
                  style={{
                    padding: "12px 15px",
                    cursor: "pointer",
                    borderBottom: "1px solid #e5e7eb",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  
                  onClick={() => {
                    console.log("Clicked place: ", place);
                    addLocation(place.lat, place.lon, place.display_name);
                  }
                  }
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "10px", fontSize: "16px" }}>📍</span>
                    <div>
                      <div style={{ fontWeight: "500" }}>{place.display_name.split(",")[0]}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "3px" }}>
                        {place.display_name.split(",").slice(1, 3).join(",")}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {/* Map */}
        <div style={{ flex: "2", height: "700px" }}>
          <MapContainer
            center={[6.9271, 79.8612]}
            zoom={13}
            style={{ 
              height: "100%", 
              width: "100%", 
              borderRadius: "10px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
            minZoom={2}
            maxZoom={18}
            worldCopyJump={true}
          >
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
              attribution="&copy; Google Maps"
            />

            {locations.map((location, index) => (
              <Marker
                key={index}
                position={[location.lat, location.lon]}
                icon={customIcon}
              >
                <Popup>
                  <div style={{ fontFamily: "'Segoe UI', sans-serif", padding: "5px" }}>
                    <div style={{ 
                      fontWeight: "bold", 
                      fontSize: "14px", 
                      borderBottom: "2px solid #3b82f6", 
                      paddingBottom: "5px", 
                      marginBottom: "5px"
                    }}>
                      {index + 1}. {location.name.split(",")[0]}
                    </div>
                    <div style={{ fontSize: "12px", color: "#4b5563" }}>
                      {location.name.split(",").slice(1, 3).join(",")}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {locations.length > 1 && (
              <RoutingMachine locations={locations} travelMode={travelMode} />
            )}
            
            <FitBoundsControl locations={locations} />
          </MapContainer>
        </div>

        {/* Itinerary panel */}
        <div style={{ 
          flex: "1", 
          backgroundColor: "#fff", 
          borderRadius: "10px",
          padding: "15px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "700px"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: "15px",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "10px"
          }}>
            <span style={{ fontSize: "20px", marginRight: "8px" }}>🗺️</span>
            <h3 style={{ margin: 0, color: "#1f2937", fontWeight: "600" }}>Itinerary</h3>
            {locations.length > 0 && (
              <div style={{ 
                marginLeft: "auto", 
                backgroundColor: "#3b82f6", 
                color: "white", 
                borderRadius: "full",
                fontSize: "14px",
                padding: "2px 8px",
                borderRadius: "12px"
              }}>
                {locations.length} {locations.length === 1 ? "stop" : "stops"}
              </div>
            )}
          </div>

          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: "15px",
            fontSize: "14px",
            color: "#6b7280"
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "5px" }}>{travelModeIcons[travelMode]}</span>
              <span style={{ textTransform: "capitalize" }}>
                {travelMode.replace("driving-", "").replace("cycling-", "").replace("foot-", "")}
              </span>
            </div>
          </div>

          {locations.length === 0 ? (
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              flex: 1,
              textAlign: "center",
              padding: "30px",
              color: "#6b7280"
            }}>
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>📍</div>
              <p style={{ marginBottom: "10px" }}>No locations added yet.</p>
              <p>Search and add locations to build your route.</p>
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              overflowY: "auto",
              paddingRight: "5px"
            }}>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="locations">
                  {(provided) => (
                    <ul
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ listStyle: "none", padding: 0, margin: 0 }}
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
                                padding: "12px",
                                background: index === 0 ? "#eef2ff" : "#fff",
                                marginBottom: "10px",
                                borderRadius: "8px",
                                border: `1px solid ${index === 0 ? "#c7d2fe" : "#e5e7eb"}`,
                                cursor: "grab",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                ...provided.draggableProps.style
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                <span style={{ 
                                  fontWeight: "bold", 
                                  marginRight: "12px",
                                  backgroundColor: index === 0 ? "#4f46e5" : "#6b7280",
                                  color: "#fff",
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontSize: "14px",
                                  flexShrink: 0
                                }}>
                                  {index + 1}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ 
                                    fontSize: "14px", 
                                    fontWeight: "500",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }}>
                                    {location.name.split(",")[0]}
                                  </div>
                                  <div style={{ 
                                    fontSize: "12px", 
                                    color: "#6b7280",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }}>
                                    {location.name.split(",").slice(1, 3).join(",")}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLocation(index);
                                }}
                                style={{
                                  background: "transparent",
                                  color: "#ef4444",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "30px",
                                  height: "30px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  marginLeft: "8px",
                                  fontSize: "16px",
                                  transition: "background-color 0.2s"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = "#fee2e2";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                ✕
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;