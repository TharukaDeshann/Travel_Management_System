import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHotel, FaCar, FaUserCheck, FaMapMarkerAlt, FaCalendarAlt, FaFilePdf, FaPrint, FaInfoCircle, FaMoneyBillWave, FaWallet } from "react-icons/fa";
import { fetchLoggedInUser } from "../services/authService";
import apiClient from "../services/axiosInstance";
import { getTravelerBookings as getHotelBookings } from "../services/hotelService";
import transportationService from "../services/transportationService";
import { getGuideReservationByDayPlan } from "../services/guideReservationService";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";
import ItineraryPDFContent from "../components/ItineraryPDFContent";

const FinalizeItinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const searchParams = new URLSearchParams(location.search);

  // Get itineraryId, dates, etc.
  const itineraryId = state.itineraryId || searchParams.get("itineraryId");
  const [itinerary, setItinerary] = useState(null);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [driverBookings, setDriverBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guideReservations, setGuideReservations] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [dropLoading, setDropLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Get logged-in user
        const userData = await fetchLoggedInUser();
        setUser(userData);
        // 2. Get itinerary details
        const itineraryRes = await apiClient.get(`/api/itineraries/${itineraryId}`);
        setItinerary(itineraryRes.data);
        // 3. Get hotel bookings
        const hotelRes = await getHotelBookings(userData.id);
        setHotelBookings(hotelRes);
        // 4. Get driver bookings
        const driverRes = await apiClient.get(`/api/drivers/bookings/traveler/${userData.id}`);
        setDriverBookings(driverRes.data);
        // 5. Get guide reservations for each day plan
        const dayPlans = itineraryRes.data?.dayPlans || [];
        const results = {};
        for (const dp of dayPlans) {
          try {
            const res = await getGuideReservationByDayPlan(dp.id);
            results[dp.id] = res;
          } catch (e) {
            results[dp.id] = null;
          }
        }
        setGuideReservations(results);
      } catch (err) {
        setError("Failed to load itinerary details. Please try again.");
        console.error("Error in FinalizeItinerary fetchData:", err);
      } finally {
        setLoading(false);
      }
    };
    if (itineraryId) {
      fetchData();
    } else {
      setError("No itinerary selected. Please start from the trip planning flow or return to the home page.");
      setLoading(false);
    }
  }, [itineraryId]);

  // Helper: get hotel booking for a day plan
  const getHotelBookingForDayPlan = (dayPlanId) =>
    hotelBookings.find((b) => b.dayPlanId === dayPlanId);

  // Helper: get driver booking for a day plan
  const getDriverBookingForDayPlan = (dayPlanId) =>
    driverBookings.find((b) => b.dayPlanId === dayPlanId);

  // Helper: get guide reservation for a day plan
  const getGuideReservationForDayPlan = (dayPlanId) => guideReservations[dayPlanId];

  // Helper: sort locations by positionIndex
  const getOrderedLocations = (locations) =>
    (locations || []).slice().sort((a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0));

  // Helper: format date
  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date.split("T")[0];
    return new Date(date).toISOString().split("T")[0];
  };

  // Filter unique day plans by date (for demo)
  const dayPlans = itinerary?.dayPlans || [];
  const uniqueDayPlans = [];
  const seenDates = new Set();
  for (const dp of dayPlans) {
    const dateStr = typeof dp.date === "string" ? dp.date.split("T")[0] : new Date(dp.date).toISOString().split("T")[0];
    if (!seenDates.has(dateStr)) {
      uniqueDayPlans.push(dp);
      seenDates.add(dateStr);
    }
  }

  // Calculate cost summary based on actual fields
  const getDayPlanIds = uniqueDayPlans.map(dp => dp.id);

  // Accommodation: sum totalPrice for hotel bookings linked to these day plans
  const totalAccommodation = hotelBookings
    .filter(b => b.dayPlanId && getDayPlanIds.includes(b.dayPlanId))
    .reduce((sum, b) => sum + (b.totalPrice ? Number(b.totalPrice) : 0), 0);

  // Transportation: sum travelCost for driver bookings linked to these day plans
  const totalTransport = driverBookings
    .filter(b => b.dayPlanId && getDayPlanIds.includes(b.dayPlanId))
    .reduce((sum, b) => sum + (b.travelCost ? Number(b.travelCost) : 0), 0);

  // Guide Fees: sum estimatedPrice for guide reservations linked to these day plans
  const guideFeeInfo = getDayPlanIds.map(dayPlanId => {
    const guideRes = guideReservations[dayPlanId];
    return guideRes && guideRes.status === 'CONFIRMED' && guideRes.estimatedPrice
      ? Number(guideRes.estimatedPrice)
      : null;
  });
  const totalGuide = guideFeeInfo.reduce((sum, fee) => sum + (fee || 0), 0);
  const hasPendingGuideFee = guideFeeInfo.some(fee => fee === null);

  const totalSpent = totalAccommodation + totalTransport + totalGuide;
  const remainingBudget = itinerary?.budget ? itinerary.budget - totalSpent : 0;

  // Helper component for per-day route map
  function DayRouteMap({ locations }) {
    if (!locations || locations.length === 0) return null;
    // Support both {lat, lon} and {latitude, longitude}
    const polyline = locations.map(loc => [loc.latitude ?? loc.lat, loc.longitude ?? loc.lon]);
    const center = polyline[0];
    return (
      <div className="my-4 rounded-xl overflow-hidden border border-blue-100 shadow-sm">
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: 200, width: "100%" }}
          scrollWheelZoom={true}      // allow zoom with mouse wheel
          dragging={true}             // allow dragging
          doubleClickZoom={true}      // allow double-click zoom
          zoomControl={true}          // show zoom controls
          attributionControl={true}   // show attribution
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={polyline} color="#2563eb" weight={4} />
          {polyline.map((pos, idx) => (
            <Marker key={idx} position={pos} />
          ))}
        </MapContainer>
      </div>
    );
  }

  // Helper to ensure all locations have latitude/longitude as numbers
  function sanitizeLocations(locations) {
    return (locations || []).map(loc => ({
      ...loc,
      latitude: Number(loc.latitude ?? loc.lat),
      longitude: Number(loc.longitude ?? loc.lon),
    }));
  }

  // Only allow PDF export when data is loaded and table is ready
  const isPdfReady = itinerary && uniqueDayPlans && uniqueDayPlans.length > 0 && !loading && !error;

  const handleDownloadPDF = () => {
    if (!isPdfReady) {
      alert("Itinerary data is still loading. Please try again in a moment.");
      return;
    }
    setPdfLoading(true);
    // Render the PDF content as HTML string
    const pdfHtml = ReactDOMServer.renderToString(
      <ItineraryPDFContent
        itinerary={itinerary}
        uniqueDayPlans={uniqueDayPlans}
        getHotelBookingForDayPlan={getHotelBookingForDayPlan}
        getDriverBookingForDayPlan={getDriverBookingForDayPlan}
        getGuideReservationForDayPlan={getGuideReservationForDayPlan}
        getOrderedLocations={getOrderedLocations}
        totalAccommodation={totalAccommodation}
        totalTransport={totalTransport}
        totalGuide={totalGuide}
        totalSpent={totalSpent}
        remainingBudget={remainingBudget}
      />
    );
    // Create a temporary container
    const container = document.createElement("div");
    container.innerHTML = pdfHtml;
    document.body.appendChild(container);
    html2pdf()
      .set({
        margin: 0.5,
        filename: `Yamu_Itinerary_${itinerary?.tripTitle || "Trip"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      })
      .from(container)
      .save()
      .then(() => {
        document.body.removeChild(container);
        setPdfLoading(false);
      })
      .catch(() => {
        document.body.removeChild(container);
        setPdfLoading(false);
      });
  };

  const handleDropItinerary = async () => {
    if (!itineraryId) return;
    setShowConfirmDialog(true);
  };

  const confirmDropItinerary = async () => {
    setShowConfirmDialog(false);
    setDropLoading(true);
    try {
      await apiClient.delete(`/api/itineraries/${itineraryId}`);
      window.alert("Itinerary deleted successfully.");
      navigate("/");
    } catch (err) {
      window.alert("Failed to delete itinerary. Please try again.");
      setDropLoading(false);
    }
  };

  const cancelDropItinerary = () => {
    setShowConfirmDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-blue-700">Loading your dream itinerary...</p>
        </div>
      </div>
    );
  }
  if (error) {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
          </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
          </div>
          </div>
          </div>
          <button
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md transition-all duration-300 transform hover:scale-105"
            onClick={() => navigate("/")}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Off-screen style for PDF export */}
      <style>{`
        .position-absolute-offscreen {
          position: absolute !important;
          left: -9999px !important;
          top: 0 !important;
          width: 100vw !important;
          height: auto !important;
          opacity: 1 !important;
          pointer-events: none !important;
          z-index: -1 !important;
        }
      `}</style>
      {/* Hidden PDF Table for Export */}
      {/* End Hidden PDF Table */}
      <div className="max-w-6xl mx-auto" id="itinerary-pdf-content">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-full shadow-lg mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {itinerary?.tripTitle || "Your Dream Trip"}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg mb-4">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <FaCalendarAlt className="text-blue-500 mr-2" />
              <span className="text-gray-700">
                {formatDate(itinerary?.startDate)} → {formatDate(itinerary?.endDate)}
              </span>
            </div>

            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <FaWallet className="text-green-500 mr-2" />
              <span className="text-gray-700">
                <span className="font-semibold">Budget:</span> {itinerary?.currency} {itinerary?.budget?.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 bg-white/50 backdrop-blur-sm inline-block px-3 py-1 rounded-full">
            Itinerary ID: {itinerary?.id}
          </div>
        </div>

        {/* Daily Itinerary Cards */}
        <div className="space-y-8">
          {uniqueDayPlans.map((dayPlan, index) => {
            const hotelBooking = getHotelBookingForDayPlan(dayPlan.id);
            const driverBooking = getDriverBookingForDayPlan(dayPlan.id);
            const locations = getOrderedLocations(dayPlan.locations);
            const guideReservation = getGuideReservationForDayPlan(dayPlan.id);
            
            return (
              <div
                key={dayPlan.id}
                className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Day/Date Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span className="font-bold">
                      Day {index + 1} - {formatDate(dayPlan.date)}
                    </span>
                  </div>
                  <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {locations.length} {locations.length === 1 ? 'location' : 'locations'}
                  </div>
                </div>

                <div className="p-6">
                  {/* Locations Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <FaMapMarkerAlt className="text-red-500 text-lg" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Places to Visit</h3>
                    </div>
                    
                    {locations.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {locations.map((loc, locIndex) => (
                            <div key={loc.id || loc.name} className="flex items-start bg-gray-50 p-3 rounded-lg">
                              <span className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-full text-xs mr-3">
                                {locIndex + 1}
                              </span>
                              <span className="text-gray-700">{loc.name}</span>
                            </div>
                          ))}
                        </div>
                        <DayRouteMap locations={sanitizeLocations(locations)} />
                      </>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                        No locations added for this day
                      </div>
                    )}
                  </div>

                  {/* Booking Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hotel Booking */}
                    <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-lg p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FaHotel className="text-blue-600 text-xl" />
                        </div>
                        <h4 className="font-bold text-blue-800">Accommodation</h4>
                      </div>
                      
                      {hotelBooking ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Hotel</span>
                            <span className="text-sm font-semibold">{hotelBooking.hotel?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Room Type</span>
                            <span className="text-sm">{hotelBooking.roomType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Check-in/out</span>
                            <span className="text-sm">
                              {formatDate(hotelBooking.checkInDate)} → {formatDate(hotelBooking.checkOutDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Guests</span>
                            <span className="text-sm">{hotelBooking.numberOfGuests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              hotelBooking.bookingStatus === 'CONFIRMED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {hotelBooking.bookingStatus}
                            </span>
                          </div>
                          <div className="pt-2 mt-2 border-t border-blue-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Total Cost</span>
                              <span className="font-bold text-blue-700">
                                {itinerary?.currency} {hotelBooking.totalPrice ? Number(hotelBooking.totalPrice).toLocaleString() : '--'}
                              </span>
                            </div>
                </div>
              </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No hotel booking for this day
                        </div>
                      )}
                </div>

                    {/* Transport Booking */}
                    <div className="bg-gradient-to-b from-green-50 to-white border border-green-100 rounded-lg p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <FaCar className="text-green-600 text-xl" />
                </div>
                        <h4 className="font-bold text-green-800">Transportation</h4>
                </div>
                      
                      {driverBooking ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Driver</span>
                            <span className="text-sm font-semibold">{driverBooking.driver?.name}</span>
                </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Vehicle</span>
                            <span className="text-sm">{driverBooking.driver?.vehicleType}</span>
                </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Route</span>
                            <span className="text-sm text-right">
                              {driverBooking.startLocationName} → {driverBooking.endLocationName}
                            </span>
                </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              driverBooking.status === 'CONFIRMED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {driverBooking.status}
                            </span>
                </div>
                          <div className="pt-2 mt-2 border-t border-green-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Travel Cost</span>
                              <span className="font-bold text-green-700">
                                {itinerary?.currency} {driverBooking.travelCost ? Number(driverBooking.travelCost).toLocaleString() : '--'}
                              </span>
                </div>
              </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No driver booking for this day
                        </div>
                      )}
                    </div>

                    {/* Guide Section */}
                    <div className="bg-gradient-to-b from-purple-50 to-white border border-purple-100 rounded-lg p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <FaUserCheck className="text-purple-600 text-xl" />
                        </div>
                        <h4 className="font-bold text-purple-800">Tour Guide</h4>
            </div>

                      {guideReservation ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Guide</span>
                            <span className="text-sm font-semibold">{guideReservation.guideName || '--'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              guideReservation.status === 'CONFIRMED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {guideReservation.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Meetup</span>
                            <span className="text-sm">{guideReservation.dayDetails?.[0]?.places || '--'}</span>
                          </div>
                          <div className="pt-2 mt-2 border-t border-purple-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Guide Fee</span>
                              <span className="font-bold text-purple-700">
                                {guideReservation.status === 'CONFIRMED' && guideReservation.estimatedPrice
                                  ? `${itinerary?.currency} ${Number(guideReservation.estimatedPrice).toLocaleString()}`
                                  : <span className="text-xs text-purple-600">Pending confirmation</span>}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No guide booking for this day
                        </div>
                      )}
                    </div>
                </div>
                </div>
              </div>
            );
          })}
                </div>

        {/* Cost Summary Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <FaMoneyBillWave /> Cost Summary
            </h2>
                </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Accommodation Cost */}
            <div className="text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-500 text-sm font-medium mb-1">Accommodation</div>
                <div className="text-2xl font-bold text-blue-700">
                  {itinerary?.currency} {totalAccommodation.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Sum of all hotel bookings</div>
                </div>
                </div>
            
            {/* Transportation Cost */}
            <div className="text-center">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-500 text-sm font-medium mb-1">Transportation</div>
                <div className="text-2xl font-bold text-green-700">
                  {itinerary?.currency} {totalTransport.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Sum of all driver bookings</div>
              </div>
            </div>

            {/* Guide Fees */}
            <div className="text-center">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-500 text-sm font-medium mb-1">Guide Fees</div>
                <div className="text-2xl font-bold text-purple-700">
                  {itinerary?.currency} {totalGuide.toLocaleString()}
                  {hasPendingGuideFee && (
                    <span className="text-xs text-purple-500 block mt-1">(+ pending fees after confirmation)</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">Sum of all guide reservations</div>
              </div>
                </div>
                </div>
          
          {/* Budget Summary */}
          <div className="px-6 pb-6">
            <div className="border-t pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-700">Initial Budget</h3>
                  <p className="text-gray-500 text-sm">{itinerary?.currency} {itinerary?.budget?.toLocaleString()}</p>
                </div>
                
                <div className="text-center">
                  <h3 className="font-bold text-gray-700">Total Spent</h3>
                  <p className="text-xl font-bold text-blue-600">
                    {itinerary?.currency} {totalSpent.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <h3 className="font-bold text-gray-700">Remaining Budget</h3>
                  <p className={`text-xl font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {itinerary?.currency} {remainingBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notice Section */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <FaInfoCircle className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Important Notes</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Some tour guide bookings are pending confirmation. Final cost may vary.</li>
                
                <li>• Please check reservations to reger your trip history.</li>
              </ul>
        </div>
      </div>
      </div>

      {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleDownloadPDF}
            disabled={!isPdfReady || pdfLoading}
          >
            {pdfLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FaFilePdf /> Download PDF
              </>
            )}
          </button>
          <button
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleDropItinerary}
            disabled={dropLoading}
          >
            {dropLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span>Dropping...</span>
              </>
            ) : (
              <>
                <FaFilePdf style={{ display: 'none' }} /> {/* visually align with other buttons */}
                Drop Itinerary
              </>
            )}
          </button>
          <button
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
            onClick={() => navigate("/reservations", { state: { activeTab: 'itineraries' } })}
          >
            Go to Trip History
        </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105"
          >
            Back to Home
        </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="text-gray-400 text-sm mb-2">Thank you for choosing Yamu</div>
          <div className="text-xs text-gray-500">Safe travels and enjoy your adventure! ✈️🌍</div>
        </div>
      </div>
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-red-200">
            <h2 className="text-xl font-bold text-red-700 mb-4">Delete Itinerary?</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this itinerary? <br />
              <span className='font-semibold'>This action cannot be undone.</span>
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                onClick={confirmDropItinerary}
                disabled={dropLoading}
              >
                {dropLoading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                onClick={cancelDropItinerary}
                disabled={dropLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalizeItinerary;