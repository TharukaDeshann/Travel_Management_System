import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "leaflet-routing-machine";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // New custom icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [1, -30],
});

// Route optimization using OpenRouteService API
const RoutingMachine = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 1) {
      const fetchRoute = async () => {
        try {
          const coords = locations.map((loc) => [loc.lon, loc.lat]);

          const response = await fetch(
            `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
            {
              method: "POST",
              headers: {
                "Authorization": "YOUR_ORS_API_KEY",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ coordinates: coords }),
            }
          );

          const data = await response.json();
          L.geoJSON(data, { color: "blue" }).addTo(map);
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      };

      fetchRoute();
    }
  }, [locations, map]);

  return null;
};

const Map = () => {
  const [locations, setLocations] = useState([]); // List of selected locations
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Suggestions from API

  // Fetch locations from OpenStreetMap Nominatim API
  const handleSearch = async (query) => {
    if (query.length > 2) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
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

  return (
    <div style={{ padding: "20px" }}>
      {/* Search Box */}
      <input
        type="text"
        placeholder="Search for a location..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value);
        }}
        style={{ width: "300px", padding: "5px", marginBottom: "10px", border: "1px solid #ccc" }}
      />

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, maxHeight: "200px", overflowY: "auto", background: "#fff", border: "1px solid #ccc" }}>
          {searchResults.map((place) => (
            <li key={place.place_id} style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #ddd" }} onClick={() => addLocation(place.lat, place.lon, place.display_name)}>
              {place.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* Selected Locations List (with Drag & Drop) */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="locations">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
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
                        padding: "10px",
                        background: "#f9f9f9",
                        marginBottom: "5px",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                        cursor: "grab",
                      }}
                    >
                      {location.name}
                      <button onClick={() => removeLocation(index)} style={{ background: "red", color: "white", border: "none", padding: "5px", cursor: "pointer" }}>
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

      {/* Map */}
      <MapContainer center={[6.9271, 79.8612]} zoom={12} style={{ height: "500px", width: "100%", marginTop: "20px" }}>
        {/* Google Maps Tile Layer for a familiar look */}
        <TileLayer url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={["mt0", "mt1", "mt2", "mt3"]} />

        {/* Add Markers */}
        {locations.map((location, index) => (
          <Marker key={index} position={[location.lat, location.lon]} icon={customIcon}>
            <Popup>{location.name}</Popup>
          </Marker>
        ))}

        {/* Draw Optimized Route */}
        {locations.length > 1 && <RoutingMachine locations={locations} />}
      </MapContainer>
    </div>
  );
};

export default Map;
