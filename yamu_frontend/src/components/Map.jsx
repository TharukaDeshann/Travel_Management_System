import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { searchLocations } from "../services/map/locationService";
import { fetchRoute, optimizeRoute, nearestNeighborOptimization } from "../services/map/routeService";
import { createDayPlan } from "../services/dayPlanService";
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
import { FaMapMarkedAlt, FaRoute, FaSave, FaSearch, FaCalendarAlt, FaHotel, FaCar, FaUserFriends, FaChevronLeft, FaChevronRight, FaMapMarkerAlt } from "react-icons/fa";
import GuidesPage from "../pages/GuidesPage";
import GuideModal from '../components/GuideModal';

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
    if ((locations || []).length > 1) {
      const drawRoute = async () => {
        try {
          const data = await fetchRoute(locations, travelMode);
          map.eachLayer((layer) => {
            if (layer.options?.className === "route-layer")
              map.removeLayer(layer);
          });
          L.geoJSON(data, {
            color: "#2563eb",
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

const Map = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const { showSuccess, showError, showWarning } = useNotification();

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const searchParams = new URLSearchParams(location.search);
  const dates = state.dates || JSON.parse(searchParams.get("dates")) || [];
  const tripTitle = state.tripTitle || searchParams.get("title") || "";
  const budget = state.budget || searchParams.get("budget") || "";
  const currency = state.currency || searchParams.get("currency") || "LKR";
  const itineraryId = state.itineraryId;
  const travelerId = state.travelerId;

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
  const [guideReservations, setGuideReservations] = useState(Array(dates.length).fill(null));
  // Add to state
  const [guideReservationId, setGuideReservationId] = useState(Array(dates.length).fill(null));
  // Add this state to track day plan IDs for each day
  const [dayPlanIds, setDayPlanIds] = useState(Array(dates.length).fill(null));
  const [showGuidePopup, setShowGuidePopup] = useState(false);

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
  const [selectedDriverSummary, setSelectedDriverSummary] = useState(null); // For passing to confirmation
  // Add to state (after other driver booking states)
  const [totalCost, setTotalCost] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);

  // Defensive: reset locations if dates length changes
  useEffect(() => {
    setLocations(Array(dates.length).fill([]));
    setHotelBooked(Array(dates.length).fill(false));
    setTransportBooked(Array(dates.length).fill(false));
    setGuideReservations(Array(dates.length).fill(null));
    setGuideReservationId(Array(dates.length).fill(null));
    setBookedHotels(Array(dates.length).fill(null));
    setDayPlanIds(Array(dates.length).fill(null)); // Reset day plan IDs
  }, [dates.length]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchLoggedInUser();
        setLoggedInUser(user);
      } catch (error) {
        console.error("Error fetching logged in user:", error);
        showError("Failed to load user data. Please try again.");
      }
    }
    loadUser();
  },[])

  useEffect(() => {
    if (dates.length === 0) navigate("/");
  }, [dates, navigate]);

  // Guard clause: don't render if locations or dates are not ready
  if (!Array.isArray(locations) || typeof currentIndex !== 'number' || !Array.isArray(locations[currentIndex]) || !Array.isArray(dates) || !dates.length) {
    return <div>Loading itinerary...</div>;
  }

  const handleSearch = async (query) => {
    if (query.length > 2) {
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
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
      ...(updatedLocations[currentIndex] || []),
      { lat, lon, name },
    ];
    setLocations(updatedLocations);
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const removeLocation = (index) => {
    const updatedLocations = [...locations];
    updatedLocations[currentIndex] = (updatedLocations[currentIndex] || []).filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(locations[currentIndex] || []);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updatedLocations = [...locations];
    updatedLocations[currentIndex] = reordered;
    setLocations(updatedLocations);
  };

  const handleBookHotel = () => {
    if ((locations[currentIndex] || []).length === 0) {
      showWarning('Please add at least one location to your route before booking a hotel.');
      return;
    }

    setShowHotelSearch(true);
  };

  const handleHotelSelect = (hotel) => {
    console.log("🏨 Hotel selected:", hotel);
    setSelectedHotel(hotel);
    setShowHotelSearch(false);
    setShowRoomAvailability(true);
  };

  const handleRoomSelect = (room, availability) => {
    console.log("🛏️ Room selected:", room);
    setSelectedRoom(room);
    setRoomAvailability(availability);
    setShowRoomAvailability(false);
    setShowHotelBooking(true);
  };

  const handleBookingComplete = (booking) => {
    console.log('Booking completed:', booking);
    // Update booked hotels state
    const updatedBookedHotels = [...bookedHotels];
    updatedBookedHotels[currentIndex] = {
      hotel: selectedHotel,
      room: selectedRoom,
      booking: booking,
    };
    setBookedHotels(updatedBookedHotels);

    // Update hotel booked status
    const updated = [...hotelBooked];
    updated[currentIndex] = true;
    setHotelBooked(updated);

    // Reset selection states
    setSelectedHotel(null);
    setSelectedRoom(null);
    setRoomAvailability(null);
    showSuccess(`Hotel booking confirmed! Booking ID: ${booking.id} at ${selectedHotel.name}`, 'Booking Confirmed');
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
      showSuccess(`Transport booked for ${dates[currentIndex]}`, 'Transport Booking');
      updated[currentIndex] = false;
      setTransportBooked([...updated]);
    }, 500);
  };

  const handleOptimizeRoute = async () => {
    if ((locations[currentIndex] || []).length < 3) {
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
      showError("Failed to optimize route. Please try again.", "Optimization Failed");
    }
  };

  // Modify handleBookGuide
  const handleBookGuide = () => {
    // Get the current locations for this day
    const currentLocations = locations[currentIndex] || [];
    const locationNames = currentLocations.map(loc => loc.name);
    
    navigate("/guides-page", {
      state: {
        fromItinerary: true,
        itineraryId,
        dayIndex: currentIndex,
        date: dates[currentIndex],
        places: locationNames, // Pass the actual location names
        travelerId,
        locations: currentLocations,
        dates, // <--- ADD THIS LINE
        tripTitle,
        budget,
        currency,
      }
    });
  };

  // Update useEffect for reservation result
  useEffect(() => {
    if (location.state?.justBookedGuideDay !== undefined && location.state?.justBookedGuideDay !== null) {
      const dayIndex = location.state.justBookedGuideDay;
      const updated = [...guideReservations];
      updated[dayIndex] = true; // Mark this day as having a guide booked
      setGuideReservations(updated);
      // Optionally clear the flag from state
      navigate(location.pathname, { replace: true, state: { ...location.state, justBookedGuideDay: undefined } });
    }
  }, [location.state]);

  // --- CRITICAL: Handle navigation back from GuideModal ---
  useEffect(() => {
    const { justBookedGuideDay, guideReservationId, dayPlanId, date } = location.state || {};
    if (
      justBookedGuideDay !== undefined &&
      guideReservationId &&
      dayPlanId &&
      date
    ) {
      // 1. Fetch reservation details to get the correct day detail ID
      apiClient.get(`/api/reservations/${guideReservationId}`).then(res => {
        const dayDetail = (res.data.dayDetails || []).find(d => d.date === date);
        if (dayDetail) {
          // 2. Link in backend
          // The backend now handles the linking via dayPlanId in the payload
          console.log("Guide reservation linked to day plan");
        }
      });
      // Optionally clear the state after processing
      navigate(location.pathname, { replace: true, state: { ...location.state, justBookedGuideDay: undefined, guideReservationId: undefined } });
    }
  }, [location.state]);

  // Update buildDayPlanRequest
  const buildDayPlanRequest = () => ({
    date: dates[currentIndex], // <-- "YYYY-MM-DD" string
    hotelDetails: "",
    transportDetails: "",
    locations: (locations[currentIndex] || []).map((loc, idx) => ({
      name: loc.name,
      address: "",
      latitude: parseFloat(loc.lat),
      longitude: parseFloat(loc.lon),
      positionIndex: idx,
      placeId: "",
      notes: ""
    })),
    route: {
      name: `${tripTitle} - Day ${currentIndex + 1}`,
      travelMode,
      totalDistance: null,
      estimatedTime: null
    }
  });

  const saveCurrentDayPlan = async () => {
    if (!itineraryId) {
      showError("Itinerary ID missing!");
      return null;
    }
    if (!locations[currentIndex] || (locations[currentIndex] || []).length === 0) {
      alert("Add at least one location before saving.");
      return null;
    }
    setSaving(true);
    try {
      const dayPlanRequest = buildDayPlanRequest();
      const savedDayPlan = await createDayPlan(itineraryId, dayPlanRequest);
      showSuccess("Day plan saved!");
      // Update dayPlanIds state
      setDayPlanIds(prev => {
        const updated = [...prev];
        updated[currentIndex] = savedDayPlan.id;
        return updated;
      });
      setSaving(false);
      return savedDayPlan;
    } catch (error) {
      showError("Failed to save day plan.");
      setSaving(false);
      return null;
    }
  };

  // Save route before moving to next day or finalizing
  const saveCurrentDayRoute = async () => {
    if (locations[currentIndex] && (locations[currentIndex] || []).length > 0) {
      await saveCurrentDayPlan();
    }
  };

  const handleNext = async () => {
    const savedDayPlan = await saveCurrentDayPlan();
    
    // If there's a guide reservation for this day, link it to the day plan
    if (guideReservations[currentIndex] && savedDayPlan) {
      try {
        const reservation = guideReservations[currentIndex];
        // Find the day detail for this specific date
        const normalizeDate = (dateStr) => dateStr.split('T')[0];
        const dayDetail = reservation.dayDetails?.find(detail =>
          normalizeDate(detail.date) === normalizeDate(dates[currentIndex])
        );
        
        if (!dayDetail) {
          showError("Could not find the correct day detail for this date. Please check your itinerary and guide reservation.");
          return;
        }

        // The backend now handles the linking via dayPlanId in the payload
        console.log("Guide reservation linked to day plan");
      } catch (error) {
        console.error("Failed to link guide reservation:", error);
      }
    }
    
    if (currentIndex < dates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate(`/finalize-itinerary?itineraryId=${itineraryId}` , {
        state: {
          dates,
          locations: locations.map(day => (day || []).map(loc => loc.name)),
          tripTitle,
          budget,
          currency,
          itineraryId, // ensure itineraryId is in state too
        },
      });
    }
  };

  // Define currentDayPlanId before rendering HotelBookingModal
  const currentDayPlanId = dayPlanIds[currentIndex] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-12">
      {/* Trip Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center mb-8 border border-blue-100 relative">
          <div className="absolute left-6 top-6 text-blue-400 text-3xl opacity-30"><FaMapMarkedAlt /></div>
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2 tracking-tight drop-shadow-lg flex items-center gap-3">
            <FaRoute className="inline-block text-blue-400" /> {tripTitle}
          </h1>
          <h2 className="text-2xl mt-2 flex items-center gap-2 text-blue-600 font-semibold">
            <FaCalendarAlt className="inline-block text-blue-400" /> Day {currentIndex + 1} - {dates[currentIndex]}
          </h2>
          <p className="mt-2 text-gray-600 text-lg">
            Budget: <span className="font-bold text-blue-700">{currency} {budget}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 px-4">
        {/* Left Column - Controls and Bookings */}
        <div className="lg:w-96 space-y-8">
          {/* Search and Transport */}
          <div className="bg-white/90 rounded-2xl shadow-xl p-6 border border-blue-100">
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
                  className="w-full p-3 border rounded-lg pl-12 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg"
                />
                <span className="absolute left-4 top-3 text-blue-400 text-xl"><FaSearch /></span>
                {showSearchResults && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-auto shadow-xl">
                    {searchResults.map((place) => (
                      <div
                        key={place.place_id}
                        onClick={() => addLocation(place.lat, place.lon, place.display_name)}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium text-blue-800">
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

              {/* Optimize Route button */}
              <div className="flex gap-2 mt-2">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2 shadow transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={handleOptimizeRoute}
                  disabled={(locations[currentIndex] || []).length < 3}
                >
                  <FaRoute /> Optimize Route
                </button>
              </div>

              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
                className="w-full p-2 border rounded-lg bg-blue-50 text-blue-700 font-semibold focus:ring-2 focus:ring-blue-400"
              >
                <option value="driving-car">🚗 Car</option>
                <option value="cycling-regular">🚴 Cycling</option>
                <option value="foot-hiking">🥾 Hiking</option>
                <option value="foot-walking">🚶 Walking</option>
              </select>
              {/* Save Button */}
              <button
                className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 shadow transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={saveCurrentDayPlan}
                disabled={saving}
              >
                <FaSave /> {saving ? "Saving..." : "Save Locations & Route"}
              </button>
            </div>
          </div>

          {/* Booking Buttons */}
          <div className="bg-white/90 rounded-2xl shadow-xl p-6 space-y-4 border border-blue-100">
            <button
              className={`w-full px-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow ${
                hotelBooked[currentIndex]
                  ? "bg-green-500 cursor-default"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handleBookHotel}
              disabled={hotelBooked[currentIndex]}
            >
              <FaHotel />
              {hotelBooked[currentIndex] 
                ? ` Hotel Booked${bookedHotels[currentIndex] ? ` - ${bookedHotels[currentIndex].hotel.name}` : ''}` 
                : "Book Hotel"
              }
            </button>

            {/* Show hotel details if booked */}
            {hotelBooked[currentIndex] && bookedHotels[currentIndex] && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm flex items-center gap-2">
                <FaHotel className="text-green-600 text-xl" />
                <div>
                  <div className="font-semibold text-green-800">
                    {bookedHotels[currentIndex].hotel.name}
                  </div>
                  <div className="text-green-700">
                    Room: {bookedHotels[currentIndex].room.roomType}
                  </div>
                  <div className="text-green-600">
                    Booking ID: {bookedHotels[currentIndex].booking.id}
                  </div>
                </div>
              </div>
            )}

            {/* Book Guide button */}
            <button
              className={`w-full px-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow ${
                guideReservations[currentIndex]
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={guideReservations[currentIndex] ? undefined : () => setShowGuidePopup(true)}
              disabled={!!guideReservations[currentIndex]}
            >
              <FaUserFriends />
              {guideReservations[currentIndex]
                ? `✓ Guide Booked`
                : "Book Tour Guide"}
            </button>

            <BookTransportButton
              onClick={() => setShowDriversPopup(true)}
              disabled={
                transportBooked[currentIndex] ||
                ((locations[currentIndex] || []).length < 2)
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
                const routeData = await fetchRoute([startLocation, endLocation], travelMode);
                const distance = routeData.features[0].properties.summary.distance;
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
                      travelCost: totalCost,      // <-- Send cost
                      travelLength: distanceKm,   // <-- Send distance
                      dayPlanId: currentDayPlanId // (if you use day plans)
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

          {/* Next Button */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 font-semibold shadow disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              <FaChevronLeft /> Previous Day
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 font-semibold shadow"
            >
              {currentIndex < dates.length - 1
                ? <>Next Day <FaChevronRight /></>
                : <>Finalize Itinerary <FaSave /></>}
            </button>
          </div>
        </div>

        {/* Right Column - Map and Itinerary */}
        <div className="flex-1 relative z-10">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-6 border border-blue-100 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Map Section */}
              <div className="flex-1 h-[28rem] relative z-0 border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
                <div className="absolute left-4 top-4 z-20 bg-white/80 px-3 py-1 rounded-full shadow text-blue-700 font-semibold flex items-center gap-2 text-lg"><FaMapMarkedAlt /> Map View</div>
                <MapContainer
                  center={[6.9271, 79.8612]}
                  zoom={13}
                  className="h-full w-full rounded-xl relative z-0"
                >
                  <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={["mt0", "mt1", "mt2", "mt3"]}
                    attribution="© Google Maps"
                  />

                  {(locations[currentIndex] || []).map((loc, index) => (
                    <Marker key={index} position={[loc.lat, loc.lon]}>
                      <Popup>
                        <div className="font-semibold">
                          {loc.name.split(",")[0]}
                        </div>
                        <div className="text-sm">
                          {loc.name.split(",").slice(1, 3).join(",")}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {locations[currentIndex].length > 1 && (
                    <RoutingMachine locations={locations[currentIndex]} travelMode={travelMode} />
                  )}
                  <FitBoundsControl locations={locations[currentIndex] || []} />
                </MapContainer>
              </div>

              {/* Compact Itinerary List */}
              <div className="lg:w-72 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-md flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2"><FaRoute /> Daily Stops</h3>
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-sm">
                    {(locations[currentIndex] || []).length} stops
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
                        {(locations[currentIndex] || []).map((loc, index) => (
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
                                className="bg-white border border-blue-100 p-3 rounded-lg shadow-sm text-sm hover:bg-blue-100 transition-colors flex items-center gap-2"
                              >
                                <span className="text-blue-400 text-lg"><FaMapMarkerAlt /></span>
                                <div className="truncate flex-1">
                                  <div className="font-medium truncate text-blue-900">
                                    {loc.name.split(",")[0]}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {loc.name.split(",").slice(1, 3).join(",")}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeLocation(index)}
                                  className="text-red-500 hover:text-red-700 ml-2 text-xs"
                                  title="Remove stop"
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
        checkOutDate={currentIndex + 1 < dates.length ? dates[currentIndex + 1] : dates[currentIndex]}
        onBookingComplete={handleBookingComplete}
        travelerId={loggedInUser ? loggedInUser.id : null}
        dayPlanId={currentDayPlanId}
      />

      {showGuidePopup && (
        <GuidesPage
          isModal={true}
          onClose={() => setShowGuidePopup(false)}
          // Pass necessary props: itineraryId, dayIndex, date, places, travelerId, etc.
          itineraryId={itineraryId}
          dayIndex={currentIndex}
          date={dates[currentIndex]}
          places={locations[currentIndex]?.map(l => l.name)}
          travelerId={loggedInUser?.id}
          dayPlanId={dayPlanIds[currentIndex]}
          // Pass any other props needed
        />
      )}
    </div>
  );
};

export default Map;
