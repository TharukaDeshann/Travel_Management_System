import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getTravelerBookings, searchHotelsAlongRoute, cancelHotelBooking } from '../services/hotelService';
import HotelCard from '../components/HotelCard';
import HotelSearchPopup from '../components/HotelSearchPopup';
import RoomAvailabilityModal from '../components/RoomAvailabilityModal';
import HotelBookingModal from '../components/HotelBookingModal';
import useNotification from '../hooks/useNotification';
import { fetchLoggedInUser } from '../services/authService';
const Reservations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedUser,setLoggedUser]=useState(null) 
  const { showSuccess, showError, showWarning } = useNotification();
  
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
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const [unreadCount, setUnreadCount] = useState(0);
  
  
  // Tab management
  const [activeTab, setActiveTab] = useState('hotels');
  
  // Hotel reservations states
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  
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
      setHotelBookings(bookings);
    } catch (error) {
      console.error('Failed to load hotel bookings:', error);
      setBookingsError('Failed to load your hotel reservations');
    } finally {
      setLoadingBookings(false);
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
    console.log('✅ Hotel booking completed:', booking);
    
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

  return (
    <Layout
      user={loggedUser}
      unreadCount={unreadCount}
      onCurrencyChange={setSelectedCurrency}
      selectedCurrency={selectedCurrency}
      navigate={navigate}
      location={location}
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
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'hotels' && (
            <div className="space-y-6">
              {/* Hotel Bookings Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Your Hotel Bookings</h2>
                    <button
                      onClick={loadHotelBookings}
                      disabled={loadingBookings}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loadingBookings ? ' Refreshing...' : ' Refresh'}
                    </button>
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

                  {!loadingBookings && !bookingsError && hotelBookings.length > 0 && (
                    <div className="grid gap-4">
                      {hotelBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{booking.hotelName}</h3>
                              <p className="text-gray-600 text-sm">{booking.roomType}</p>
                              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                  <p className="font-medium">LKR {booking.totalPrice?.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                Ref: {booking.bookingReference}
                              </p>
                              {booking.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleCancelBooking(booking)}
                                  disabled={booking.isCanelling}
                                  className={`mt-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    booking.isCanelling 
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : 'bg-red-600 text-white hover:bg-red-700'
                                  }`}
                                >
                                  {booking.isCanelling ? (
                                    <span className="flex items-center gap-1">
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
                        </div>
                      ))}
                    </div>
                  )}
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
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Transportation Reservations</h3>
                <p className="text-gray-600 mb-6">
                  This feature is currently under development. Soon you'll be able to:
                </p>
                <div className="text-left max-w-md mx-auto space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-3">🚗</span>
                    <span>Book rental cars and vehicles</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">🚌</span>
                    <span>Reserve bus and shuttle services</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">✈️</span>
                    <span>Manage flight bookings</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">🚂</span>
                    <span>Book train tickets</span>
                  </div>
                </div>
                <div className="mt-8">
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                    Coming Soon
                  </span>
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

        {/* Cancel Booking Confirmation Modal */}
        {showCancelModal && bookingToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                    <div><strong>Hotel:</strong> {bookingToCancel.hotelName}</div>
                    <div><strong>Room:</strong> {bookingToCancel.roomType}</div>
                    <div><strong>Check-in:</strong> {formatDate(bookingToCancel.checkInDate)}</div>
                    <div><strong>Check-out:</strong> {formatDate(bookingToCancel.checkOutDate)}</div>
                    <div><strong>Guests:</strong> {bookingToCancel.numberOfGuests}</div>
                    <div><strong>Total:</strong> LKR {bookingToCancel.totalPrice?.toLocaleString()}</div>
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
      </div>
    </Layout>
  );
};

export default Reservations;