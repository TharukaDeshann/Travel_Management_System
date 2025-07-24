import apiClient from "./axiosInstance";

// Hotel Search Service
export const searchHotelsAlongRoute = async (locations, radius = 2000, minRating = 1.0, maxResults = 10) => {
  try {
    if (locations.length === 0) {
      throw new Error('No locations provided');
    }

    // Calculate center point or use first/last location for route search
    const startLocation = locations[0];
    const endLocation = locations[locations.length - 1] || startLocation;

    const searchRequest = {
      startLatitude: parseFloat(startLocation.lat),
      startLongitude: parseFloat(startLocation.lon),
      endLatitude: parseFloat(endLocation.lat),
      endLongitude: parseFloat(endLocation.lon),
      radius: radius,
      minRating: minRating,
      maxResults: maxResults
    };

    console.log('🔍 Searching hotels with request:', searchRequest);

    const response = await apiClient.post('/api/hotels/search', searchRequest);
    console.log('🏨 Hotels found:', response.data.length);
    
    return response.data;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};

// Get Hotel Details
export const getHotelDetails = async (hotelId) => {
  try {
    const response = await apiClient.get(`/api/hotels/${hotelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw error;
  }
};


// Get Room Availability
export const getHotelAvailability = async (hotelId, checkIn, checkOut) => {
  try {
    console.log(`🔍 Fetching room availability for hotel: ${hotelId}, dates: ${checkIn} to ${checkOut}`);
    
    const response = await apiClient.get(`/api/hotels/${hotelId}/availability`, {
      params: {
        checkIn: checkIn,
        checkOut: checkOut
      }
    });
    
    console.log('🏨 Room availability received:', response.data);
    
    // Transform the response to match frontend expectations
    const transformedData = {
      checkInDate: response.data.checkInDate,
      checkOutDate: response.data.checkOutDate,
      hotelId: hotelId,
      availableRooms: response.data.availableRooms.map(room => {
        const pricePerNight = parseFloat(room.pricePerNight);
        
        console.log('🏨 Room price parsing:', {
          roomType: room.roomType,
          originalPrice: room.pricePerNight,
          parsedPrice: pricePerNight,
          isNaN: isNaN(pricePerNight)
        });
        
        return {
          roomType: formatRoomTypeName(room.roomType),
          capacity: room.maxOccupancy,
          pricePerNight: isNaN(pricePerNight) ? 0 : pricePerNight,
          availableCount: room.availableRooms,
          totalCount: room.availableRooms + Math.floor(Math.random() * 5) + 1, // Mock total count
          amenities: room.amenities || []
        };
      })
    };
    
    console.log('🏨 Transformed room availability:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('❌ Error fetching room availability:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Helper function to format room type names
const formatRoomTypeName = (roomTypeEnum) => {
  if (typeof roomTypeEnum === 'string') {
    return roomTypeEnum;
  }
  
  // Convert enum to readable format
  const typeMap = {
    'SINGLE': 'Single Room',
    'DOUBLE': 'Double Room',
    'TWIN': 'Twin Room',
    'DELUXE': 'Deluxe Suite',
    'SUITE': 'Executive Suite',
    'FAMILY_ROOM': 'Family Room',
    'PRESIDENTIAL_SUITE': 'Presidential Suite'
  };
  
  return typeMap[roomTypeEnum] || roomTypeEnum.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Create Hotel Booking
export const createHotelBooking = async (bookingData, travelerId) => {
  try {
    console.log('📝 Creating booking:', bookingData);
    const response = await apiClient.post(`/api/hotels/bookings?travelerId=${travelerId}`, bookingData);
    console.log('✅ Booking created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Get Traveler Bookings
export const getTravelerBookings = async (travelerId) => {
  try {
    const response = await apiClient.get(`/api/hotels/bookings/traveler/${travelerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching traveler bookings:', error);
    throw error;
  }
};

// Cancel Hotel Booking
export const cancelHotelBooking = async (bookingReference, travelerId) => {
  try {
    console.log('🚫 Cancelling booking:', bookingReference);
    const response = await apiClient.put(`/api/hotels/bookings/${bookingReference}/cancel?travelerId=${travelerId}`);
    console.log('✅ Booking cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};
