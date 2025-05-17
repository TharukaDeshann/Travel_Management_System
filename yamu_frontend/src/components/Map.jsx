import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { searchLocations, saveRoute } from "../services/map/locationService";
import { fetchRoute, optimizeRoute, nearestNeighborOptimization } from "../services/map/routeService";

// Marker icon configuration
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RoutingMachine = ({ locations, travelMode }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 1) {
      const drawRoute = async () => {
        try {
          const data = await fetchRoute(locations, travelMode);
          map.eachLayer((layer) => {
            if (layer.options?.className === "route-layer") map.removeLayer(layer);
          });

          L.geoJSON(data, {
            color: "#2563eb",
            weight: 5,
            className: "route-layer",
            dashArray: travelMode.includes("foot") ? "5, 10" : null
          }).addTo(map);

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

const FitBoundsControl = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

const Map = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dates = JSON.parse(searchParams.get("dates")) || [];
  const tripTitle = searchParams.get("title") || "";
  const budget = searchParams.get("budget") || "";
  const currency = searchParams.get("currency") || "LKR";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [locations, setLocations] = useState(Array(dates.length).fill([]));
  const [hotelBooked, setHotelBooked] = useState(Array(dates.length).fill(false));
  const [transportBooked, setTransportBooked] = useState(Array(dates.length).fill(false));
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [travelMode, setTravelMode] = useState("driving-car");
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (dates.length === 0) navigate("/");
  }, [dates, navigate]);

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

  const addLocation = (lat, lon, name) => {
    const updatedLocations = [...locations];
    updatedLocations[currentIndex] = [...updatedLocations[currentIndex], { lat, lon, name }];
    setLocations(updatedLocations);
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const removeLocation = (index) => {
    const updatedLocations = [...locations];
    updatedLocations[currentIndex] = updatedLocations[currentIndex].filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(locations[currentIndex]);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updatedLocations = [...locations];
    updatedLocations[currentIndex] = reordered;
    setLocations(updatedLocations);
  };

  const handleBookHotel = () => {
    const updated = [...hotelBooked];
    updated[currentIndex] = true;
    setHotelBooked(updated);
    setTimeout(() => {
      alert(`Hotel booked for ${dates[currentIndex]}`);
      updated[currentIndex] = false;
      setHotelBooked([...updated]);
    }, 500);
  };

  const handleBookTransport = () => {
    const updated = [...transportBooked];
    updated[currentIndex] = true;
    setTransportBooked(updated);
    setTimeout(() => {
      alert(`Transport booked for ${dates[currentIndex]}`);
      updated[currentIndex] = false;
      setTransportBooked([...updated]);
    }, 500);
  };

  const handleNext = () => {
    if (currentIndex < dates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/finalize-itinerary", {
        state: {
          dates,
          locations: locations.map(day => day.map(loc => loc.name)),
          tripTitle,
          budget,
          currency
        }
      });
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      {/* Trip Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">{tripTitle}</h1>
        <h2 className="text-xl mt-2">
          Day {currentIndex + 1} - {dates[currentIndex]}
        </h2>
        <p className="mt-2 text-gray-600">
          Budget: {currency} {budget}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Controls and Bookings */}
        <div className="lg:w-96 space-y-6">
          {/* Search and Transport */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full p-3 border rounded-lg pl-10"
                />
                <span className="absolute left-3 top-3 text-gray-500">🔍</span>

                {showSearchResults && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-auto">
                    {searchResults.map((place) => (
                      <div
                        key={place.place_id}
                        onClick={() => addLocation(place.lat, place.lon, place.display_name)}
                        className="p-3 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium">{place.display_name.split(",")[0]}</div>
                        <div className="text-sm text-gray-500">
                          {place.display_name.split(",").slice(1, 3).join(",")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="driving-car">🚗 Car</option>
                <option value="cycling-regular">🚴 Cycling</option>
                <option value="foot-hiking">🥾 Hiking</option>
                <option value="foot-walking">🚶 Walking</option>
              </select>
            </div>
          </div>

          {/* Booking Buttons */}
          <div className="bg-white rounded-lg shadow-xl p-6 space-y-4">
            <button
              className={`w-full px-6 py-3 rounded text-white ${hotelBooked[currentIndex] ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={handleBookHotel}
              disabled={hotelBooked[currentIndex]}
            >
              {hotelBooked[currentIndex] ? "Booking Hotel..." : "Book Hotel"}
            </button>

            <button
              className="w-full px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => alert("Navigated to Tour Guide Booking Form.")}
            >
              Book Tour Guide
            </button>

            <button
              className={`w-full px-6 py-3 rounded text-white ${transportBooked[currentIndex] ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}
              onClick={handleBookTransport}
              disabled={transportBooked[currentIndex]}
            >
              {transportBooked[currentIndex] ? "Booking Transport..." : "Book Transport"}
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {currentIndex < dates.length - 1 ? "Next Day →" : "Finalize Itinerary"}
          </button>
        </div>

        {/* Right Column - Map and Itinerary */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Map Section */}
              <div className="flex-1 h-96">
                <MapContainer
                  center={[6.9271, 79.8612]}
                  zoom={13}
                  className="h-full w-full rounded-lg"
                >
                  <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={["mt0", "mt1", "mt2", "mt3"]}
                    attribution="© Google Maps"
                  />

                  {locations[currentIndex].map((loc, index) => (
                    <Marker key={index} position={[loc.lat, loc.lon]}>
                      <Popup>
                        <div className="font-semibold">{loc.name.split(",")[0]}</div>
                        <div className="text-sm">{loc.name.split(",").slice(1, 3).join(",")}</div>
                      </Popup>
                    </Marker>
                  ))}

                  {locations[currentIndex].length > 1 && (
                    <RoutingMachine locations={locations[currentIndex]} travelMode={travelMode} />
                  )}
                  <FitBoundsControl locations={locations[currentIndex]} />
                </MapContainer>
              </div>

              {/* Compact Itinerary List */}
              <div className="lg:w-64 bg-white border rounded-lg p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Daily Stops</h3>
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-sm">
                    {locations[currentIndex].length} stops
                  </span>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="locations">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                        {locations[currentIndex].map((loc, index) => (
                          <Draggable key={index} draggableId={String(index)} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-50 p-2 rounded shadow-xs text-sm hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="truncate">
                                    <div className="font-medium truncate">{loc.name.split(",")[0]}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {loc.name.split(",").slice(1, 3).join(",")}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeLocation(index)}
                                    className="text-red-500 hover:text-red-700 ml-2 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;