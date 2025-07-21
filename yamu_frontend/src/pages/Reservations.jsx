import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getTravelerBookings, searchHotelsAlongRoute, cancelHotelBooking } from '../services/hotelService';
import { transportationService } from '../services/transportationService';
import HotelCard from '../components/HotelCard';
import HotelSearchPopup from '../components/HotelSearchPopup';
import RoomAvailabilityModal from '../components/RoomAvailabilityModal';
import HotelBookingModal from '../components/HotelBookingModal';
import AvailableDriversPopup from '../components/AvailableDriversPopup';
import ConfirmDriverSelection from '../components/ConfirmDriverSelection';
import LocationSelector from '../components/LocationSelector';
import useNotification from '../hooks/useNotification';
import { fetchLoggedInUser } from '../services/authService';
import apiClient from "../services/axiosInstance";
import { useCurrency } from '../context/CurrencyContext';
import PriceDisplay from '../components/PriceDisplay';

const Reservations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedUser,setLoggedUser]=useState(null) 
  const { showSuccess, showError, showWarning } = useNotification();
  const { formatAmount, convertAmount } = useCurrency();
  
  useEffect(() => {
    const  loadUser=async() => {
        try {
            const user=await fetchLoggedInUser()
            setLoggedUser(user)
            setLoadingBookings(true);
            setBookingsError(null);
            const bookings = await getTravelerBookings(user.id);
            setHotelBookings(bookings);
        } catch (error) {
            console.error('Failed to fetch logged in user:', error);
            showError('Failed to load user information');
        }
       
    }
     loadUser()
    console.log('🏨 Loaded logged in user:', loggedUser);

  },[])
  
  // Layout states
  const [unreadCount, setUnreadCount] = useState(0);
  
  
  // Tab management
  const [activeTab, setActiveTab] = useState('hotels');
  
  // Hotel reservations states
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  
  // Guide reservations states
  const [guideReservations, setGuideReservations] = useState([]);
  const [loadingGuideReservations, setLoadingGuideReservations] = useState(false);
  const [guideReservationsError, setGuideReservationsError] = useState(null);
  const [guideReservationFilter, setGuideReservationFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'declined', 'completed'
  
  // Location and nearby hotels states
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingNearbyHotels, setLoadingNearbyHotels] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Hotel booking modal states
  const [showHotelSearch, setShowHotelSearch] = useState(false);
  const [showRoomAvailability, setShowRoomAvailability] = useState(false);
  const [showHotelBooking, setShowHotelBooking] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState(null);
  
  // Cancel booking modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  
  // Booking filter states
  const [bookingFilter, setBookingFilter] = useState('active'); // 'active' or 'cancelled'
  
  // Transportation states
  const [transportBookings, setTransportBookings] = useState([]);
  const [loadingTransportBookings, setLoadingTransportBookings] = useState(false);
  const [transportBookingsError, setTransportBookingsError] = useState(null);
  const [transportFilter, setTransportFilter] = useState('active');
  
  // Driver booking states
  const [showDriverSelection, setShowDriverSelection] = useState(false);
  const [showDriverConfirmation, setShowDriverConfirmation] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [startLocation, setStartLocation] = useState({ name: '', latitude: 0, longitude: 0 });
  const [endLocation, setEndLocation] = useState({ name: '', latitude: 0, longitude: 0 });
  const [bookingDriverId, setBookingDriverId] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // Store route distance and duration
  
  // Transport booking cancel states
  const [showTransportCancelModal, setShowTransportCancelModal] = useState(false);
  const [transportBookingToCancel, setTransportBookingToCancel] = useState(null);
  
  // Search parameters
  const [searchParams, setSearchParams] = useState({
    radius: 5000, // 5km default
    minRating: 3.0,
    maxResults: 15
  });

  useEffect(() => {
    if (activeTab === 'hotels') {
      loadHotelBookings();
      getCurrentLocation();
    } else if (activeTab === 'transportation') {
      loadTransportBookings();
    } else if (activeTab === 'guides') {
      loadGuideReservations();
    }
  }, [activeTab]);

  const loadHotelBookings = async () => {
    if (!loggedUser?.id) {
      setBookingsError('Loading Bookings');
      return;
    }

    setLoadingBookings(true);
    setBookingsError(null);
    
    try {
      const bookings = await getTravelerBookings(loggedUser.id);
      console.log('🏨 Loaded hotel bookings:', bookings);
      setHotelBookings(bookings);
    } catch (error) {
      console.error('Failed to load hotel bookings:', error);
      setBookingsError('Failed to load your hotel reservations');
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadGuideReservations = async () => {
    if (!loggedUser?.id) {
      setGuideReservationsError('User not loaded');
      return;
    }

    setLoadingGuideReservations(true);
    setGuideReservationsError(null);
    
    try {
      const reservations = await apiClient.get(`/api/reservations/traveler/${loggedUser.id}`);
      console.log('🧭 Loaded guide reservations:', reservations.data);
      setGuideReservations(reservations.data);
    } catch (error) {
      console.error('Failed to load guide reservations:', error);
      setGuideReservationsError('Failed to load your guide reservations');
    } finally {
      setLoadingGuideReservations(false);
    }
  };

  const loadTransportBookings = async () => {
    if (!loggedUser?.id) {
      setTransportBookingsError('User not loaded');
      return;
    }

    setLoadingTransportBookings(true);
    setTransportBookingsError(null);
    
    try {
      const bookings = await transportationService.getTravelerBookings(loggedUser.id);
      console.log('🚗 Loaded transport bookings:', bookings);
      setTransportBookings(bookings);
    } catch (error) {
      console.error('Failed to load transport bookings:', error);
      setTransportBookingsError('Failed to load your transportation bookings');
    } finally {
      setLoadingTransportBookings(false);
    }
  };

  const handleGuideReservationAction = async (reservationId, action) => {
    try {
      let endpoint;
      switch (action) {
        case 'cancel':
          endpoint = `/api/reservations/${reservationId}/decline`;
          break;
        default:
          return;
      }

      await apiClient.put(endpoint);
      
      // Update the reservation status in the local state
      setGuideReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === reservationId 
            ? { ...res, status: action === 'cancel' ? 'DECLINED' : res.status }
            : res
        )
      );

      showSuccess(`Reservation ${action}led successfully!`, 'Action Completed');
    } catch (error) {
      console.error(`Failed to ${action} reservation:`, error);
      showError(`Failed to ${action} reservation. Please try again.`);
    }
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setUserLocation(location);
        setLoadingLocation(false);
        searchNearbyHotels(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Unable to get your location. Please enable location services.');
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  const searchNearbyHotels = async (location) => {
    setLoadingNearbyHotels(true);
    
    try {
      console.log('🔍 Searching nearby hotels for location:', location);
      const hotels = await searchHotelsAlongRoute(
        [location], // Use current location as single point
        searchParams.radius,
        searchParams.minRating,
        searchParams.maxResults
      );
      setNearbyHotels(hotels);
      console.log('🏨 Found nearby hotels:', hotels.length);
    } catch (error) {
      console.error('Failed to search nearby hotels:', error);
      showError('Failed to find nearby hotels');
    } finally {
      setLoadingNearbyHotels(false);
    }
  };

  const handleHotelSelect = (hotel) => {
    console.log('🏨 Hotel selected:', hotel);
    setSelectedHotel(hotel);
    setShowRoomAvailability(true);
  };

  const handleRoomSelect = (room, availability) => {
    console.log('🛏️ Room selected:', room);
    setSelectedRoom(room);
    setRoomAvailability(availability);
    setShowRoomAvailability(false);
    setShowHotelBooking(true);
  };

  const handleBookingComplete = (booking) => {
    console.log(' Hotel booking completed:', booking);
    
    showSuccess(`Hotel booking confirmed! Booking ID: ${booking.id}`, 'Booking Confirmed');
    
    // Refresh bookings list
    loadHotelBookings();
    
    // Reset modal states
    handleCloseModals();
  };

  const handleCancelBooking = async (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    // Set loading state for this specific booking
    setHotelBookings(prevBookings => 
      prevBookings.map(b => 
        b.id === bookingToCancel.id 
          ? { ...b, isCanelling: true }
          : b
      )
    );

    try {
      await cancelHotelBooking(bookingToCancel.bookingReference, loggedUser.id);
      showSuccess(`Booking cancelled successfully for ${bookingToCancel.hotelName}`, 'Booking Cancelled');
      loadHotelBookings(); // Refresh the list
      setShowCancelModal(false);
      setBookingToCancel(null);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      
      // Remove loading state on error
      setHotelBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingToCancel.id 
            ? { ...b, isCanelling: false }
            : b
        )
      );
      
      // Show specific error message if available
      const errorMessage = error.response?.data?.error || error.message || 'Failed to cancel booking. Please try again.';
      showError(errorMessage);
      setShowCancelModal(false);
      setBookingToCancel(null);
    }
  };

  // Calculate total cost based on distance and driver's rate
  const calculateTotalCost = (driver, distanceKm) => {
    if (!driver || !distanceKm) return 0;
    
    // Use driver's rate per km if available, otherwise use a default rate
    const ratePerKm = driver.ratePerKm || driver.rate || 50; // Default 50 LKR per km
    const baseFare = 200; // Base fare in LKR
    
    return baseFare + (distanceKm * ratePerKm);
  };

  // Transport cost display component
  const TransportCostDisplay = ({ cost, className = "" }) => {
    return (
      <PriceDisplay 
        price={cost} 
        fromCurrency="LKR"
        className={className}
      />
    );
  };

  // Transportation related functions
  const handleBookTransport = () => {
    // Check if both locations are selected
    if (!startLocation.name || !endLocation.name) {
      showError('Please select both pickup and drop-off locations');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setShowDriverSelection(true);
  };

  const handleDriverSelect = async (driverId, driverSummary) => {
    try {
      const driverDetails = await transportationService.getDriverDetails(driverId);
      console.log(driverDetails)
      setSelectedDriver(driverDetails);
      setBookingDriverId(driverId);
      setShowDriverSelection(false);
      setShowDriverConfirmation(true);
    } catch (error) {
      console.error('Failed to get driver details:', error);
      showError('Failed to load driver details');
    }
  };

  const handleConfirmDriverBooking = async () => {
    if (!selectedDriver || !bookingDriverId || !selectedDate) return;

    try {
      const bookingData = {
        driverId: bookingDriverId,
        date: selectedDate,
        travelerId: loggedUser.id,
        startLocation: startLocation.name ? startLocation : null,
        endLocation: endLocation.name ? endLocation : null
      };

      const result = await transportationService.bookDriver(bookingData);
      
      if (result === 'BOOKED') {
        showSuccess(`Driver ${selectedDriver.name} booked successfully for ${formatDate(selectedDate)}!`, 'Booking Confirmed');
        loadTransportBookings(); // Refresh bookings
      } else {
        showError('Driver is already booked for this date');
      }
    } catch (error) {
      console.error('Failed to book driver:', error);
      showError('Failed to book driver. Please try again.');
    } finally {
      setShowDriverConfirmation(false);
      setSelectedDriver(null);
      setBookingDriverId(null);
    }
  };

  const handleCancelTransportBooking = (booking) => {
    setTransportBookingToCancel(booking);
    setShowTransportCancelModal(true);
  };

  const confirmCancelTransportBooking = async () => {
    if (!transportBookingToCancel) return;

    try {
      const cancelData = {
        driverId: transportBookingToCancel.driverId,
        date: transportBookingToCancel.bookingDate,
        travelerId: loggedUser.id
      };

      await transportationService.cancelDriverBooking(cancelData);
      showSuccess(`Transport booking cancelled successfully!`, 'Booking Cancelled');
      loadTransportBookings(); // Refresh the list
      setShowTransportCancelModal(false);
      setTransportBookingToCancel(null);
    } catch (error) {
      console.error('Failed to cancel transport booking:', error);
      showError('Failed to cancel booking. Please try again.');
      setShowTransportCancelModal(false);
      setTransportBookingToCancel(null);
    }
  };

  const handleCloseModals = () => {
    setShowHotelSearch(false);
    setShowRoomAvailability(false);
    setShowHotelBooking(false);
    setSelectedHotel(null);
    setSelectedRoom(null);
    setRoomAvailability(null);
  };

  const handleRefreshLocation = () => {
    getCurrentLocation();
  };

  const handleUpdateSearchParams = (newParams) => {
    setSearchParams(newParams);
    if (userLocation) {
      searchNearbyHotels(userLocation);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDefaultCheckInDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getDefaultCheckOutDate = () => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow.toISOString().split('T')[0];
  };

  // Function to remove duplicate hotels
  const getUniqueHotels = (hotels) => {
    const unique = [];
    const seenIds = new Set();
    const seenNames = new Set();

    hotels.forEach(hotel => {
      // Create a unique identifier based on ID, name, and address
      const identifier = hotel.id || `${hotel.name}-${hotel.address}`;
      
      // Check if we've seen this hotel before
      if (!seenIds.has(identifier)) {
        // Also check for duplicate names in the same location (additional safety)
        const nameLocationKey = `${hotel.name}-${hotel.address}`;
        if (!seenNames.has(nameLocationKey)) {
          unique.push(hotel);
          seenIds.add(identifier);
          seenNames.add(nameLocationKey);
        }
      }
    });

    return unique;
  };

  // Function to filter and sort bookings
  const getFilteredAndSortedBookings = () => {
    let filtered = hotelBookings;
    
    // Filter by status
    if (bookingFilter === 'active') {
      filtered = hotelBookings.filter(booking => booking.bookingStatus !== 'CANCELLED');
    } else if (bookingFilter === 'cancelled') {
      filtered = hotelBookings.filter(booking => booking.bookingStatus === 'CANCELLED');
    }
    
    // Sort by check-in date (nearest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.checkInDate);
      const dateB = new Date(b.checkInDate);
      return dateA - dateB;
    });
    
    return filtered;
  };

  // Function to filter and sort transport bookings
  const getFilteredAndSortedTransportBookings = () => {
    let filtered = transportBookings;
    
    // Filter by status
    if (transportFilter === 'active') {
      filtered = transportBookings.filter(booking => booking.status !== 'CANCELLED');
    } else if (transportFilter === 'cancelled') {
      filtered = transportBookings.filter(booking => booking.status === 'CANCELLED');
    }
    
    // Sort by booking date (nearest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.bookingDate);
      const dateB = new Date(b.bookingDate);
      return dateA - dateB;
    });
    
    return filtered;
  };

  // Function to filter and sort guide reservations
  const getFilteredAndSortedGuideReservations = () => {
    let filtered = guideReservations;
    
    // Filter by status
    if (guideReservationFilter !== 'all') {
      filtered = guideReservations.filter(reservation => 
        reservation.status.toLowerCase() === guideReservationFilter.toLowerCase()
      );
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    
    return filtered;
  };

  return (
    <Layout
      user={loggedUser}
      unreadCount={unreadCount}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reservations</h1>
            <p className="text-gray-600">Manage your bookings and find new places to stay</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('hotels')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'hotels'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🏨 Hotel Reservations
                </button>
                <button
                  onClick={() => setActiveTab('transportation')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'transportation'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🚗 Transportation
                </button>
                <button
                  onClick={() => setActiveTab('guides')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'guides'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🧭 Guide Reservations
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'guides' && (
            <div className="space-y-6">
              {/* Guide Reservations Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Your Guide Reservations</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {(() => {
                          const statusCounts = guideReservations.reduce((acc, res) => {
                            acc[res.status] = (acc[res.status] || 0) + 1;
                            return acc;
                          }, {});
                          
                          const statusTexts = Object.entries(statusCounts).map(([status, count]) => 
                            `${count} ${status.toLowerCase()}`
                          );
                          
                          return statusTexts.join(', ') || 'No reservations';
                        })()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Filter Buttons */}
                      <div className="flex bg-gray-100 rounded-lg p-1 flex-wrap">
                        {['all', 'pending', 'confirmed', 'declined', 'completed'].map((filterStatus) => (
                          <button
                            key={filterStatus}
                            onClick={() => setGuideReservationFilter(filterStatus)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              guideReservationFilter === filterStatus
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                          </button>
                        ))}
                      </div>
                      
                      {/* Refresh Button */}
                      <button
                        onClick={loadGuideReservations}
                        disabled={loadingGuideReservations}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                      >
                        {loadingGuideReservations ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loadingGuideReservations && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading your guide reservations...</p>
                    </div>
                  )}

                  {guideReservationsError && (
                    <div className="text-center py-8">
                      <div className="text-red-600 text-lg">⚠️ {guideReservationsError}</div>
                      <button
                        onClick={loadGuideReservations}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!loadingGuideReservations && !guideReservationsError && guideReservations.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-lg">🧭 No guide reservations found</div>
                      <p className="text-sm text-gray-400 mt-2">Book your first guide to get started!</p>
                      <button
                        onClick={() => navigate('/guides-page', { state: { currentUser: loggedUser } })}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                      >
                        Find Guides
                      </button>
                    </div>
                  )}

                  {!loadingGuideReservations && !guideReservationsError && guideReservations.length > 0 && (() => {
                    const filteredReservations = getFilteredAndSortedGuideReservations();
                    
                    if (filteredReservations.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-lg">
                            📅 No {guideReservationFilter === 'all' ? '' : guideReservationFilter} guide reservations found
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            {guideReservationFilter === 'all' 
                              ? 'You have no guide reservations' 
                              : `You have no ${guideReservationFilter} guide reservations`
                            }
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        {/* Results Summary */}
                        <div className="mb-4 text-sm text-gray-600">
                          Showing {filteredReservations.length} {guideReservationFilter === 'all' ? '' : guideReservationFilter} guide reservation{filteredReservations.length !== 1 ? 's' : ''} 
                          (sorted by creation date)
                        </div>
                        
                        <div className="grid gap-6">
                          {filteredReservations.map((reservation) => (
                            <div key={reservation.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                          Reservation #{reservation.id}
                                        </h3>
                                        <div className="space-y-1 text-sm text-gray-600">
                                          <div><strong>Guide:</strong> {reservation.guideName || 'Not available'}</div>
                                          <div><strong>Contact:</strong> {reservation.guideContact || 'Not available'}</div>
                                          <div><strong>Days:</strong> {reservation.numberOfDays}</div>
                                          <div><strong>Created:</strong> {formatDate(reservation.createdAt)}</div>
                                          {reservation.updatedAt && (
                                            <div><strong>Last Updated:</strong> {formatDate(reservation.updatedAt)}</div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Status Badge */}
                                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                        reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        reservation.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                                        reservation.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {reservation.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Day Details */}
                                {reservation.dayDetails && reservation.dayDetails.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Itinerary Details:</h4>
                                    <div className="space-y-2">
                                      {reservation.dayDetails.map((day, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                                            <div>
                                              <span className="text-gray-500">Day {day.dayNumber}:</span>
                                              <p className="font-medium">{day.places}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-500">Date:</span>
                                              <p className="font-medium">{formatDate(day.date)}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-500">Travelers:</span>
                                              <p className="font-medium">{day.numberOfTravelers}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-500">Vehicle:</span>
                                              <p className="font-medium">
                                                {day.vehicleRequested 
                                                  ? (day.vehicleDetails || 'Requested') 
                                                  : 'Not requested'
                                                }
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                  {reservation.status === 'PENDING' && (
                                    <button
                                      onClick={() => handleGuideReservationAction(reservation.id, 'cancel')}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                    >
                                      Cancel Reservation
                                    </button>
                                  )}
                                  
                                  {reservation.guideId && (
                                    <button
                                      onClick={() => navigate(`/inbox?select=${reservation.guideId}`)}
                                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                      Message Guide
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => navigate('/traveler-upcoming-trips')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                  >
                                    View Trip Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Existing Hotel and Transportation tabs content remains the same */}
          {activeTab === 'hotels' && (
            // ... existing hotel tab content ...
            <div className="space-y-6">
              {/* Hotel Bookings Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Your Hotel Bookings</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {(() => {
                          const activeCount = hotelBookings.filter(b => b.bookingStatus !== 'CANCELLED').length;
                          const cancelledCount = hotelBookings.filter(b => b.bookingStatus === 'CANCELLED').length;
                          return `${activeCount} active, ${cancelledCount} cancelled bookings`;
                        })()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Filter Buttons */}
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setBookingFilter('active')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            bookingFilter === 'active'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Active Bookings
                        </button>
                        <button
                          onClick={() => setBookingFilter('cancelled')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            bookingFilter === 'cancelled'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Cancelled
                        </button>
                      </div>
                      
                      {/* Refresh Button */}
                      <button
                        onClick={loadHotelBookings}
                        disabled={loadingBookings}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                      >
                        {loadingBookings ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loadingBookings && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading your bookings...</p>
                    </div>
                  )}

                  {bookingsError && (
                    <div className="text-center py-8">
                      <div className="text-red-600 text-lg"> {bookingsError}</div>
                      <button
                        onClick={loadHotelBookings}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!loadingBookings && !bookingsError && hotelBookings.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-lg">🏨 No hotel bookings found</div>
                      <p className="text-sm text-gray-400 mt-2">Book your first hotel below!</p>
                    </div>
                  )}

                  {!loadingBookings && !bookingsError && hotelBookings.length > 0 && (() => {
                    const filteredBookings = getFilteredAndSortedBookings();
                    
                    if (filteredBookings.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-lg">
                            {bookingFilter === 'active' ? '📅' : '❌'} No {bookingFilter} bookings found
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            {bookingFilter === 'active' 
                              ? 'All your bookings have been cancelled or completed' 
                              : 'You have no cancelled bookings'
                            }
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        {/* Results Summary */}
                        <div className="mb-4 text-sm text-gray-600">
                          Showing {filteredBookings.length} {bookingFilter} booking{filteredBookings.length !== 1 ? 's' : ''} 
                         
                        </div>
                        
                        <div className="grid gap-6">
                          {filteredBookings.map((booking) => (
                            <div key={booking.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="flex">
                                {/* Hotel Image */}
                                <div className="w-48 h-36 flex-shrink-0">
                                  <img
                                    src={booking.hotel?.photoUrl || '/hotels/1.webp'}
                                    alt={booking.hotel?.name || booking.hotelName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = '/hotels/1.webp';
                                    }}
                                  />
                                </div>
                                
                                {/* Booking Details */}
                                <div className="flex-1 p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h3 className="text-lg font-semibold text-gray-900">
                                            {booking.hotel?.name || booking.hotelName}
                                          </h3>
                                          {booking.hotel?.address && (
                                            <p className="text-gray-600 text-sm mb-1">{booking.hotel.address}</p>
                                          )}
                                          <div className="flex items-center gap-2 mb-2">
                                            {booking.hotel?.rating && (
                                              <div className="flex items-center">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-sm font-medium text-gray-700 ml-1">
                                                  {booking.hotel.rating}
                                                </span>
                                                {booking.hotel.totalRatings && (
                                                  <span className="text-xs text-gray-500 ml-1">
                                                    ({booking.hotel.totalRatings} reviews)
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                            <span className="text-gray-400">•</span>
                                            <span className="text-sm text-gray-600">{booking.roomType}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Status and Actions */}
                                        <div className="text-right">
                                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                            booking.bookingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            booking.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {booking.bookingStatus}
                                          </span>
                                          {booking.bookingStatus === 'CONFIRMED' && (
                                            <button
                                              onClick={() => handleCancelBooking(booking)}
                                              disabled={booking.isCanelling}
                                              className={`mt-2 px-3 py-1 rounded text-xs font-medium transition-colors block w-full ${
                                                booking.isCanelling 
                                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                                  : 'bg-red-600 text-white hover:bg-red-700'
                                              }`}
                                            >
                                              {booking.isCanelling ? (
                                                <span className="flex items-center justify-center gap-1">
                                                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                  </svg>
                                                  Cancelling...
                                                </span>
                                              ) : (
                                                'Cancel Booking'
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Booking Information Grid */}
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                          <span className="text-gray-500">Check-in:</span>
                                          <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Check-out:</span>
                                          <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Guests:</span>
                                          <p className="font-medium">{booking.numberOfGuests}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Total:</span>
                                          <div className={`font-medium text-lg ${
                                            booking.bookingStatus === 'CANCELLED' ? 'text-gray-500 line-through' : 'text-green-600'
                                          }`}>
                                            <PriceDisplay 
                                              price={booking.totalPrice} 
                                              fromCurrency="LKR"
                                              className={booking.bookingStatus === 'CANCELLED' ? 'text-gray-500' : 'text-green-600'}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Booking Reference */}
                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                          <span>Booking Reference: {booking.bookingReference}</span>
                                          <span>Booked on: {formatDate(booking.createdAt)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Nearby Hotels Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Hotels Near You</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRefreshLocation}
                        disabled={loadingLocation}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {loadingLocation ? ' Getting Location...' : ' Refresh Location'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Search Parameters */}
                  <div className="mt-4 flex flex-wrap gap-4 items-center text-sm">
                    <div>
                      <label className="text-gray-600 mr-2">Radius:</label>
                      <select 
                        value={searchParams.radius}
                        onChange={(e) => handleUpdateSearchParams({...searchParams, radius: parseInt(e.target.value)})}
                        className="px-2 py-1 border rounded"
                      >
                        <option value={2000}>2 km</option>
                        <option value={5000}>5 km</option>
                        <option value={10000}>10 km</option>
                        <option value={20000}>20 km</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-600 mr-2">Min Rating:</label>
                      <select 
                        value={searchParams.minRating}
                        onChange={(e) => handleUpdateSearchParams({...searchParams, minRating: parseFloat(e.target.value)})}
                        className="px-2 py-1 border rounded"
                      >
                        <option value={1.0}>1+ Stars</option>
                        <option value={2.0}>2+ Stars</option>
                        <option value={3.0}>3+ Stars</option>
                        <option value={4.0}>4+ Stars</option>
                        <option value={4.5}>4.5+ Stars</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {locationError && (
                    <div className="text-center py-8">
                      <div className="text-orange-600 text-lg"> {locationError}</div>
                      <button
                        onClick={handleRefreshLocation}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Enable Location
                      </button>
                    </div>
                  )}

                  {loadingNearbyHotels && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Finding nearby hotels...</p>
                    </div>
                  )}

                  {!loadingNearbyHotels && !locationError && nearbyHotels.length === 0 && userLocation && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-lg">🏨 No hotels found nearby</div>
                      <p className="text-sm text-gray-400 mt-2">Try adjusting the search radius</p>
                    </div>
                  )}

                  {!loadingNearbyHotels && !locationError && nearbyHotels.length > 0 && (
                    <div className="space-y-4">
                      {(() => {
                        // Get unique hotels using our deduplication function
                        const uniqueHotels = getUniqueHotels(nearbyHotels);
                        
                        return (
                          <>
                            <div className="text-sm text-gray-600 mb-4">
                              Found {uniqueHotels.length} hotels within {searchParams.radius/1000}km of your location
                              {nearbyHotels.length !== uniqueHotels.length && (
                                <span className="text-gray-500"> </span>
                              )}
                            </div>
                            
                            {uniqueHotels.map((hotel, index) => (
                              <HotelCard 
                                key={hotel.id || `hotel-${index}`}
                                hotel={hotel}
                                onSelect={() => handleHotelSelect(hotel)}
                              />
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transportation Tab */}
          {activeTab === 'transportation' && (
            <div className="space-y-6">
              {/* Transport Bookings Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Your Transportation Bookings</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {(() => {
                          const activeCount = transportBookings.filter(b => b.status !== 'CANCELLED').length;
                          const cancelledCount = transportBookings.filter(b => b.status === 'CANCELLED').length;
                          return `${activeCount} active, ${cancelledCount} cancelled bookings`;
                        })()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Filter Buttons */}
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setTransportFilter('active')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            transportFilter === 'active'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Active Bookings
                        </button>
                        <button
                          onClick={() => setTransportFilter('cancelled')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            transportFilter === 'cancelled'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Cancelled
                        </button>
                      </div>
                      
                      {/* Refresh Button */}
                      <button
                        onClick={loadTransportBookings}
                        disabled={loadingTransportBookings}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                      >
                        {loadingTransportBookings ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loadingTransportBookings && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading your transport bookings...</p>
                    </div>
                  )}

                  {transportBookingsError && (
                    <div className="text-center py-8">
                      <div className="text-red-600 text-lg">⚠️ {transportBookingsError}</div>
                      <button
                        onClick={loadTransportBookings}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!loadingTransportBookings && !transportBookingsError && transportBookings.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-lg">🚗 No transportation bookings found</div>
                      <p className="text-sm text-gray-400 mt-2">Book your first transport below!</p>
                    </div>
                  )}

                  {!loadingTransportBookings && !transportBookingsError && transportBookings.length > 0 && (() => {
                    const filteredBookings = getFilteredAndSortedTransportBookings();
                    
                    if (filteredBookings.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-lg">
                            {transportFilter === 'active' ? '📅' : '❌'} No {transportFilter} transport bookings found
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            {transportFilter === 'active' 
                              ? 'All your transport bookings have been cancelled or completed' 
                              : 'You have no cancelled transport bookings'
                            }
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        {/* Results Summary */}
                        <div className="mb-4 text-sm text-gray-600">
                          Showing {filteredBookings.length} {transportFilter} transport booking{filteredBookings.length !== 1 ? 's' : ''} 
                          (sorted by booking date)
                        </div>
                        
                        <div className="grid gap-6">
                          {filteredBookings.map((booking, index) => (
                            <div key={booking.id || index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="flex">
                                {/* Driver Photo */}
                                <div className="w-48 h-36 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                                  {booking.driver?.photoBase64 ? (
                                    <img
                                      src={`data:image/jpeg;base64,${booking.driver.photoBase64}`}
                                      alt={booking.driver.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-gray-400 text-6xl">�</div>
                                  )}
                                </div>
                                
                                {/* Booking Details */}
                                <div className="flex-1 p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h3 className="text-lg font-semibold text-gray-900">
                                            {booking.driver?.name || 'Driver Name'}
                                          </h3>
                                          <p className="text-gray-600 text-sm mb-1">
                                            {booking.driver?.vehicleType} - {booking.driver?.vehicleNumber}
                                          </p>
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="flex items-center">
                                              <span className="text-yellow-500">★</span>
                                              <span className="text-sm font-medium text-gray-700 ml-1">
                                                {booking.driver?.rating || 'N/A'}
                                              </span>
                                            </div>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-sm text-gray-600">
                                              {booking.driver?.vehicleBrand} {booking.driver?.vehicleModel}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {/* Status and Actions */}
                                        <div className="text-right">
                                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            booking.status === 'BOOKED' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {booking.status}
                                          </span>
                                          {booking.status === 'BOOKED' && (
                                            <button
                                              onClick={() => handleCancelTransportBooking(booking)}
                                              className="mt-2 px-3 py-1 rounded text-xs font-medium transition-colors block w-full bg-red-600 text-white hover:bg-red-700"
                                            >
                                              Cancel Booking
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Booking Information Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <span className="text-gray-500">Booking Date:</span>
                                          <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">From:</span>
                                          <p className="font-medium">{booking.startLocationName || 'Not specified'}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">To:</span>
                                          <p className="font-medium">{booking.endLocationName || 'Not specified'}</p>
                                        </div>
                                      </div>
                                      
                                      {/* Booking Reference */}
                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                          <span>Driver ID: {booking.driverId}</span>
                                          <span>Traveler ID: {booking.travelerId}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Book New Transport Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Book Transportation</h2>
                  <p className="text-gray-600 text-sm mt-1">Find and book available drivers for your trips</p>
                </div>

                <div className="p-6">
                  {/* Location Selector Component */}
                  <LocationSelector
                    pickupLocation={startLocation}
                    dropoffLocation={endLocation}
                    onLocationChange={(location, locationType) => {
                      if (locationType === 'pickup') {
                        setStartLocation(location);
                      } else if (locationType === 'dropoff') {
                        setEndLocation(location);
                      }
                    }}
                    onRouteChange={(routeData) => {
                      setRouteInfo(routeData);
                    }}
                    title="Select Pick-up and Drop-off Locations"
                    height="400px"
                  />

                  {/* Route Information Display */}
                  {/* {routeInfo && startLocation.name && endLocation.name && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Route Information</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600">📏</span>
                          <span className="font-medium">Distance:</span>
                          <span className="text-blue-600 font-semibold">{routeInfo.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-orange-600">⏱️</span>
                          <span className="font-medium">Est. Time:</span>
                          <span className="text-orange-600 font-semibold">
                            {routeInfo.duration < 60 
                              ? `${routeInfo.duration} min` 
                              : `${Math.floor(routeInfo.duration / 60)}h ${routeInfo.duration % 60}m`
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600">💰</span>
                          <span className="font-medium">Est. Cost:</span>
                          <span className="text-green-600 font-semibold">
                            Rs.{(200 + (routeInfo.distance * 50)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )} */}

                  <div className="text-center mt-6">
                    <button
                      onClick={handleBookTransport}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      🚗 Find Available Drivers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hotel Booking Modals */}
        <RoomAvailabilityModal
          isOpen={showRoomAvailability}
          onClose={handleCloseModals}
          hotel={selectedHotel}
          checkInDate={getDefaultCheckInDate()}
          checkOutDate={getDefaultCheckOutDate()}
          onRoomSelect={handleRoomSelect}
        />

        <HotelBookingModal
          isOpen={showHotelBooking}
          onClose={handleCloseModals}
          hotel={selectedHotel}
          selectedRoom={selectedRoom}
          availability={roomAvailability}
          checkInDate={getDefaultCheckInDate()}
          checkOutDate={getDefaultCheckOutDate()}
          onBookingComplete={handleBookingComplete}
          travelerId={loggedUser?.id}
        />

        {/* Transportation Modals */}
        <AvailableDriversPopup
          isOpen={showDriverSelection}
          onClose={() => setShowDriverSelection(false)}
          date={selectedDate}
          onSelectDriver={handleDriverSelect}
        />

        {selectedDriver && (
          <ConfirmDriverSelection
            driver={selectedDriver}
            totalCost={calculateTotalCost(selectedDriver, routeInfo?.distance || 0)}
            distanceKm={routeInfo?.distance || 0}
            onConfirm={handleConfirmDriverBooking}
            onCancel={() => {
              setShowDriverConfirmation(false);
              setSelectedDriver(null);
              setBookingDriverId(null);
            }}
          />
        )}

        {/* Cancel Hotel Booking Confirmation Modal */}
        {showCancelModal && bookingToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1040] p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cancel Hotel Booking
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="space-y-2 text-sm">
                    <div><strong>Hotel:</strong> {bookingToCancel.hotel?.name || bookingToCancel.hotelName}</div>
                    <div><strong>Room:</strong> {bookingToCancel.roomType}</div>
                    <div><strong>Check-in:</strong> {formatDate(bookingToCancel.checkInDate)}</div>
                    <div><strong>Check-out:</strong> {formatDate(bookingToCancel.checkOutDate)}</div>
                    <div><strong>Guests:</strong> {bookingToCancel.numberOfGuests}</div>
                    <div className="flex items-center gap-2">
                      <strong>Total:</strong> 
                      <PriceDisplay 
                        price={bookingToCancel.totalPrice} 
                        fromCurrency="LKR"
                        size="small"
                      />
                    </div>
                    <div><strong>Ref:</strong> {bookingToCancel.bookingReference}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setBookingToCancel(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  disabled={bookingToCancel?.isCanelling}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
                >
                  {bookingToCancel?.isCanelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Transport Booking Confirmation Modal */}
        {showTransportCancelModal && transportBookingToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1040] p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cancel Transport Booking
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to cancel this transport booking? This action cannot be undone.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="space-y-2 text-sm">
                    <div><strong>Driver:</strong> {transportBookingToCancel.driver?.name || 'Driver'}</div>
                    <div><strong>Vehicle:</strong> {transportBookingToCancel.driver?.vehicleType}</div>
                    <div><strong>Date:</strong> {formatDate(transportBookingToCancel.bookingDate)}</div>
                    <div><strong>From:</strong> {transportBookingToCancel.startLocationName || 'Not specified'}</div>
                    <div><strong>To:</strong> {transportBookingToCancel.endLocationName || 'Not specified'}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTransportCancelModal(false);
                    setTransportBookingToCancel(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelTransportBooking}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reservations;