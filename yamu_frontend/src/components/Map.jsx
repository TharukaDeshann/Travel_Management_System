import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { searchLocations } from "../services/map/locationService";
import {
  fetchRoute,
  optimizeRoute,
  nearestNeighborOptimization,
} from "../services/map/routeService";
import { useNotification } from "../hooks/useNotification";
import axios from "axios";

// Hotel booking components
import HotelSearchPopup from "./HotelSearchPopup";
import RoomAvailabilityModal from "./RoomAvailabilityModal";
import HotelBookingModal from "./HotelBookingModal";
import BookTransportButton from "./BookTransportButton";
import AvailableDriversPopup from "./AvailableDriversPopup";
import ConfirmDriverSelection from "./ConfirmDriverSelection";
import apiClient from "../services/axiosInstance";
import { fetchLoggedInUser } from "../services/authService";

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

const RoutingMachine = ({ locations, travelMode }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 1) {
      const drawRoute = async () => {
        try {
          const data = await fetchRoute(locations, travelMode);
          map.eachLayer((layer) => {
            if (layer.options?.className === "route-layer")
              map.removeLayer(layer);
          });

          L.geoJSON(data, {
            color: "#4285F4",
            weight: 5,
            className: "route-layer",
            dashArray: travelMode.includes("foot") ? "5, 10" : null,
          }).addTo(map);

          if (locations.length > 0) {
            const bounds = L.latLngBounds(
              locations.map((loc) => [loc.lat, loc.lon])
            );
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
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

const GOOGLE_MAPS_STYLE =
  "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"; // satellite + hybrid labels

const MODERN_BG_GRADIENT =
  "bg-gradient-to-br from-gray-100 via-white to-blue-100 dark:from-gray-900 dark:to-blue-950";

const VEHICLE_OPTIONS = [
  { key: "driving-car", icon: "🚗", label: "Car" },
  { key: "cycling-regular", icon: "🚴", label: "Cycling" },
  { key: "foot-hiking", icon: "🥾", label: "Hiking" },
  { key: "foot-walking", icon: "🚶", label: "Walking" },
];

const Map = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError, showWarning } = useNotification();
  const searchParams = new URLSearchParams(location.search);
  const dates = JSON.parse(searchParams.get("dates")) || [];
  const tripTitle = searchParams.get("title") || "";
  const budget = searchParams.get("budget") || "";
  const currency = searchParams.get("currency") || "LKR";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [locations, setLocations] = useState(Array(dates.length).fill([]));
  const [hotelBooked, setHotelBooked] = useState(
    Array(dates.length).fill(false)
  );
  const [transportBooked, setTransportBooked] = useState(
    Array(dates.length).fill(false)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [travelMode, setTravelMode] = useState("driving-car");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hotel booking states
  const [showHotelSearch, setShowHotelSearch] = useState(false);
  const [showRoomAvailability, setShowRoomAvailability] = useState(false);
  const [showHotelBooking, setShowHotelBooking] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState(null);
  const [bookedHotels, setBookedHotels] = useState(
    Array(dates.length).fill(null)
  );

  // Driver booking states
  const [showDriversPopup, setShowDriversPopup] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDriverSummary, setSelectedDriverSummary] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchLoggedInUser();
        setLoggedInUser(user);
      } catch (error) {
        console.error("Error fetching logged in user:", error);
        showError("Failed to load user data. Please try again.");
      }
    };
    loadUser();
  }, []);

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
    updatedLocations[currentIndex] = [
      ...updatedLocations[currentIndex],
      { lat, lon, name },
    ];
    setLocations(updatedLocations);
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const removeLocation = (index) => {
    const updatedLocations = [...locations];
    updatedLocations[currentIndex] = updatedLocations[currentIndex].filter(
      (_, i) => i !== index
    );
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
    if (locations[currentIndex].length === 0) {
      showWarning(
        "Please add at least one location to your route before booking a hotel."
      );
      return;
    }
    setShowHotelSearch(true);
  };

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    setShowHotelSearch(false);
    setShowRoomAvailability(true);
  };

  const handleRoomSelect = (room, availability) => {
    setSelectedRoom(room);
    setRoomAvailability(availability);
    setShowRoomAvailability(false);
    setShowHotelBooking(true);
  };

  const handleBookingComplete = (booking) => {
    const updatedBookedHotels = [...bookedHotels];
    updatedBookedHotels[currentIndex] = {
      hotel: selectedHotel,
      room: selectedRoom,
      booking: booking,
    };
    setBookedHotels(updatedBookedHotels);

    const updated = [...hotelBooked];
    updated[currentIndex] = true;
    setHotelBooked(updated);

    setSelectedHotel(null);
    setSelectedRoom(null);
    setRoomAvailability(null);
    showSuccess(
      `Hotel booking confirmed! Booking ID: ${booking.id} at ${selectedHotel.name}`,
      "Booking Confirmed"
    );
  };

  const handleCloseModals = () => {
    setShowHotelSearch(false);
    setShowRoomAvailability(false);
    setShowHotelBooking(false);
    setSelectedHotel(null);
    setSelectedRoom(null);
    setRoomAvailability(null);
  };

  const handleBookTransport = () => {
    const updated = [...transportBooked];
    updated[currentIndex] = true;
    setTransportBooked(updated);
    setTimeout(() => {
      showSuccess(
        `Transport booked for ${dates[currentIndex]}`,
        "Transport Booking"
      );
      updated[currentIndex] = false;
      setTransportBooked([...updated]);
    }, 500);
  };

  const handleOptimizeRoute = async () => {
    if (locations[currentIndex].length < 3) {
      showWarning("Need at least 3 locations to optimize route.");
      return;
    }
    try {
      const optimized = await optimizeRoute(
        locations[currentIndex],
        travelMode
      );
      const updatedLocations = [...locations];
      updatedLocations[currentIndex] = optimized;
      setLocations(updatedLocations);
      showSuccess("Route optimized successfully!", "Route Optimization");
    } catch (error) {
      showError(
        "Failed to optimize route. Please try again.",
        "Optimization Failed"
      );
    }
  };

  const handleSaveRoute = async () => {
    if (!locations[currentIndex] || locations[currentIndex].length === 0) {
      showWarning("Add at least one location before saving.");
      return;
    }
    setSaving(true);
    try {
      const routeData = {
        name: `${tripTitle} - Day ${currentIndex + 1}`,
        travelMode,
        locations: locations[currentIndex].map((loc, idx) => ({
          name: loc.name,
          latitude: parseFloat(loc.lat),
          longitude: parseFloat(loc.lon),
          positionIndex: idx,
        })),
      };
      await axios.post("/api/routes", routeData);
      showSuccess("Route saved successfully!", "Route Saved");
    } catch (error) {
      console.error("Error saving route:", error);
      showError("Failed to save route. Please try again.", "Save Failed");
    }
    setSaving(false);
  };

  const saveCurrentDayRoute = async () => {
    if (locations[currentIndex] && locations[currentIndex].length > 0) {
      await handleSaveRoute();
    }
  };

  const handleNext = async () => {
    await saveCurrentDayRoute();
    if (currentIndex < dates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/finalize-itinerary", {
        state: {
          dates,
          locations: locations.map((day) => day.map((loc) => loc.name)),
          tripTitle,
          budget,
          currency,
        },
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-100 px-0 py-0 flex flex-col items-center justify-start"
      style={{ fontFamily: "Google Sans, Roboto, Arial, sans-serif" }}
    >
      {/* Trip Header */}
      <div className="w-full max-w-5xl mx-auto mb-8 pt-8 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#4285F4] tracking-tight drop-shadow-lg">
              {tripTitle}
            </h1>
            <h2 className="text-xl mt-2 text-gray-800 dark:text-gray-200">
              Day {currentIndex + 1} &mdash; {dates[currentIndex]}
            </h2>
            <p className="mt-2 text-gray-500 font-medium">
              Budget:{" "}
              <span className="font-bold">
                {currency} {budget}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-8 w-full max-w-7xl mx-auto px-4 pb-12">
        {/* Left Card: Controls & Bookings */}
        <div className="w-96 flex flex-col gap-8">
          {/* Search & Route Controls */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
            <div className="space-y-6">
              {/* Location Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full p-3 border border-gray-200 rounded-xl pl-12 text-gray-800 focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] font-medium shadow-sm transition"
                  style={{ background: "#F7FBFF" }}
                />
                <span className="absolute left-4 top-3 text-gray-400 text-xl">
                  <svg width={20} height={20} fill="currentColor">
                    <path d="M8.5 2a6.5 6.5 0 015.28 10.5l4.11 4.12a1 1 0 01-1.42 1.41l-4.12-4.11A6.5 6.5 0 118.5 2zm0 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                  </svg>
                </span>
                {showSearchResults && (
                  <div className="absolute z-20 w-full bg-white border-t border-gray-100 rounded-xl mt-1 max-h-60 overflow-auto shadow-lg">
                    {searchResults.map((place) => (
                      <div
                        key={place.place_id}
                        onClick={() =>
                          addLocation(place.lat, place.lon, place.display_name)
                        }
                        className="flex flex-col p-3 hover:bg-[#F2F6FE] cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium text-[#4285F4]">
                          {place.display_name.split(",")[0]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {place.display_name.split(",").slice(1, 3).join(",")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Route Controls */}
              <div className="flex gap-3 mt-2">
                <button
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold bg-[#F4B400] text-white hover:bg-[#F4B400]/90 transition ${
                    locations[currentIndex].length < 3
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={handleOptimizeRoute}
                  disabled={locations[currentIndex].length < 3}
                >
                  <span className="mr-1">⚡</span>
                  Optimize Route
                </button>
                <button
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold bg-[#4285F4] text-white hover:bg-[#4285F4]/90 transition ${
                    saving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSaveRoute}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Route"}
                </button>
              </div>

              {/* Vehicle Segmented Control */}
              <div className="flex gap-2 mt-4">
                {VEHICLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`flex-1 py-2 rounded-xl font-medium border 
                      ${
                        travelMode === opt.key
                          ? "bg-[#4285F4] text-white border-[#4285F4]"
                          : "bg-white hover:bg-blue-50 text-gray-700 border-gray-300"
                      }
                      transition shadow-sm flex flex-col items-center`}
                    onClick={() => setTravelMode(opt.key)}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 space-y-5">
            <button
              className={`w-full px-6 py-3 rounded-xl font-semibold transition ${
                hotelBooked[currentIndex]
                  ? "bg-[#34A853] cursor-default text-white"
                  : "bg-[#4285F4] hover:bg-[#4285F4]/90 text-white"
              }`}
              onClick={handleBookHotel}
              disabled={hotelBooked[currentIndex]}
            >
              {hotelBooked[currentIndex]
                ? ` Hotel Booked${
                    bookedHotels[currentIndex]
                      ? ` - ${bookedHotels[currentIndex].hotel.name}`
                      : ""
                  }`
                : "Book Hotel"}
            </button>
            {hotelBooked[currentIndex] && bookedHotels[currentIndex] && (
              <div className="bg-[#E6F4EA] border border-[#34A853]/30 rounded-xl p-3 text-sm">
                <div className="font-semibold text-[#34A853]">
                  {bookedHotels[currentIndex].hotel.name}
                </div>
                <div className="text-[#34A853]/90">
                  Room: {bookedHotels[currentIndex].room.roomType}
                </div>
                <div className="text-[#34A853]/70">
                  Booking ID: {bookedHotels[currentIndex].booking.id}
                </div>
              </div>
            )}
            <button
              className="w-full px-6 py-3 bg-[#F4B400] text-white rounded-xl font-semibold hover:bg-[#F4B400]/90 transition"
              onClick={() =>
                showSuccess(
                  "Navigated to Tour Guide Booking Form.",
                  "Tour Guide Booking"
                )
              }
            >
              Book Tour Guide
            </button>
            <BookTransportButton
              onClick={() => setShowDriversPopup(true)}
              disabled={
                transportBooked[currentIndex] ||
                locations[currentIndex].length < 2
              }
            />
            <AvailableDriversPopup
              isOpen={showDriversPopup}
              onClose={() => setShowDriversPopup(false)}
              date={dates[currentIndex]}
              onSelectDriver={async (driverId, summary) => {
                setSelectedDriverId(driverId);
                setSelectedDriverSummary(summary);
                setShowDriversPopup(false);
                // Calculate route and cost
                const dayLocations = locations[currentIndex];
                const startLocation = dayLocations[0];
                const endLocation = dayLocations[dayLocations.length - 1];
                const routeData = await fetchRoute(
                  [startLocation, endLocation],
                  travelMode
                );
                const distance =
                  routeData.features[0].properties.summary.distance;
                const distanceKm = distance / 1000;
                setDistanceKm(distanceKm);
                setTotalCost(distanceKm * summary.ratePerLng);

                setShowConfirm(true);
              }}
            />
            {showConfirm && selectedDriverId && (
              <ConfirmDriverSelection
                driver={selectedDriverSummary}
                totalCost={totalCost}
                distanceKm={distanceKm}
                onConfirm={async () => {
                  const dayLocations = locations[currentIndex];
                  const startLocation = dayLocations[0];
                  const endLocation = dayLocations[dayLocations.length - 1];
                  const userStr = localStorage.getItem("user");
                  const user = userStr ? JSON.parse(userStr) : null;
                  const userId = user ? user.id : null;

                  try {
                    await apiClient.post("/api/drivers/book", {
                      driverId: selectedDriverId,
                      date: dates[currentIndex],
                      travelerId: userId,
                      startLocation: {
                        name: startLocation.name,
                        latitude: startLocation.lat,
                        longitude: startLocation.lon,
                      },
                      endLocation: {
                        name: endLocation.name,
                        latitude: endLocation.lat,
                        longitude: endLocation.lon,
                      },
                      travelCost: totalCost, // <-- NEW
                      travelLength: distanceKm, // <-- Optional, if you want to save length too
                    });
                    showSuccess("Driver Booked Successfully");
                    setTransportBooked((prev) => {
                      const updated = [...prev];
                      updated[currentIndex] = true;
                      return updated;
                    });
                    setShowConfirm(false);
                  } catch (err) {
                    showError("Failed to book driver.");
                    console.error("Error booking driver:", err);
                  }
                }}
                onCancel={() => setShowConfirm(false)}
              />
            )}
          </div>
          <button
            onClick={handleNext}
            className="w-full px-6 py-3 bg-[#34A853] text-white rounded-xl font-bold hover:bg-[#34A853]/90 shadow-lg mt-2 transition"
          >
            {currentIndex < dates.length - 1
              ? "Next Day →"
              : "Finalize Itinerary"}
          </button>
        </div>

        {/* Right: Map Full Height, Daily Stops floating on z axis OVER map */}
        <div className="flex-1 relative z-10 flex flex-col items-center">
          <div className="relative w-full h-[700px]">
            {/* Map Section */}
            <MapContainer
              center={[6.9271, 79.8612]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                url={GOOGLE_MAPS_STYLE}
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                attribution="Map data ©2025 Google"
              />
              {locations[currentIndex].map((loc, index) => (
                <Marker key={index} position={[loc.lat, loc.lon]}>
                  <Popup>
                    <div className="font-semibold text-[#4285F4]">
                      {loc.name.split(",")[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {loc.name.split(",").slice(1, 3).join(",")}
                    </div>
                  </Popup>
                </Marker>
              ))}
              {locations[currentIndex].length > 1 && (
                <RoutingMachine
                  locations={locations[currentIndex]}
                  travelMode={travelMode}
                />
              )}
              <FitBoundsControl locations={locations[currentIndex]} />
            </MapContainer>
            {/* Daily Stops floating card in z axis OVER the map, top center */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2 top-4 w-2/3 max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-4 z-[999]"
              style={{ pointerEvents: "auto" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#4285F4]">
                  Daily Stops
                </h3>
                <span className="bg-[#4285F4] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {locations[currentIndex].length} stops
                </span>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="locations">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {locations[currentIndex].map((loc, index) => (
                        <Draggable
                          key={index}
                          draggableId={String(index)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-[#F7FBFF] p-3 rounded-xl shadow-xs text-sm hover:bg-[#E3F0FE] transition-colors flex justify-between items-center border border-gray-100"
                            >
                              <div className="truncate flex flex-col">
                                <span className="font-medium text-[#4285F4] truncate">
                                  {loc.name.split(",")[0]}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                  {loc.name.split(",").slice(1, 3).join(",")}
                                </span>
                              </div>
                              <button
                                onClick={() => removeLocation(index)}
                                className="text-red-500 hover:text-red-700 ml-2 text-xs rounded-full px-2 py-1 transition shadow-sm"
                                aria-label="Remove stop"
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
            </div>
          </div>
        </div>
      </div>
      {/* Hotel Booking Modals */}
      <HotelSearchPopup
        isOpen={showHotelSearch}
        onClose={handleCloseModals}
        locations={locations[currentIndex]}
        selectedDate={dates[currentIndex]}
        onHotelSelect={handleHotelSelect}
      />
      <RoomAvailabilityModal
        isOpen={showRoomAvailability}
        onClose={handleCloseModals}
        hotel={selectedHotel}
        checkInDate={dates[currentIndex]}
        checkOutDate={
          currentIndex + 1 < dates.length
            ? dates[currentIndex + 1]
            : dates[currentIndex]
        }
        onRoomSelect={handleRoomSelect}
      />
      <HotelBookingModal
        isOpen={showHotelBooking}
        onClose={handleCloseModals}
        hotel={selectedHotel}
        selectedRoom={selectedRoom}
        availability={roomAvailability}
        checkInDate={dates[currentIndex]}
        checkOutDate={
          currentIndex + 1 < dates.length
            ? dates[currentIndex + 1]
            : dates[currentIndex]
        }
        onBookingComplete={handleBookingComplete}
        travelerId={loggedInUser ? loggedInUser.id : null}
      />
    </div>
  );
};

export default Map;
