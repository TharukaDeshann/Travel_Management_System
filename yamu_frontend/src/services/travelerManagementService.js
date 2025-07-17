
import apiClient  from './axiosInstance'; // Assuming you have apiClient configured

/**
 * Get traveler's guide reservations
 * @param {number} travelerId - The traveler's ID
 * @returns {Promise} - Promise containing guide reservations data
 */
export const getTravelerGuideReservations = async (travelerId) => {
  try {
    const response = await apiClient.get(`/api/admin/travelers/${travelerId}/guide-reservations`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching guide reservations for traveler ${travelerId}:`, error);
    throw error;
  }
};

/**
 * Get traveler's hotel bookings
 * @param {number} travelerId - The traveler's ID
 * @returns {Promise} - Promise containing hotel bookings data
 */
export const getTravelerHotelBookings = async (travelerId) => {
  try {
    const response = await apiClient.get(`/api/admin/travelers/${travelerId}/hotel-bookings`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hotel bookings for traveler ${travelerId}:`, error);
    throw error;
  }
};

/**
 * Get traveler's driver bookings
 * @param {number} travelerId - The traveler's ID
 * @returns {Promise} - Promise containing driver bookings data
 */
export const getTravelerDriverBookings = async (travelerId) => {
  try {
    const response = await apiClient.get(`/api/admin/travelers/${travelerId}/driver-bookings`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching driver bookings for traveler ${travelerId}:`, error);
    throw error;
  }
};

/**
 * Get all travelers (filter endpoint)
 * @returns {Promise} - Promise containing all travelers data
 */
export const getAllTravelers = async () => {
  try {
    const response = await apiClient.get('/api/admin/travelers/role/TRAVELER');
    return response.data;
  } catch (error) {
    console.error('Error fetching all travelers:', error);
    throw error;
  }
};

/**
 * Delete a traveler account
 * @param {number} travelerId - The traveler's ID
 * @returns {Promise} - Promise containing deletion response
 */
export const deleteTraveler = async (travelerId) => {
  try {
    const response = await apiClient.delete(`/api/admin/travelers/${travelerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting traveler ${travelerId}:`, error);
    throw error;
  }
};

/**
 * Get all bookings for a traveler (combines all booking types)
 * @param {number} travelerId - The traveler's ID
 * @returns {Promise} - Promise containing all bookings data
 */
export const getAllTravelerBookings = async (travelerId) => {
  try {
    const [guideReservations, hotelBookings, driverBookings] = await Promise.all([
      getTravelerGuideReservations(travelerId),
      getTravelerHotelBookings(travelerId),
      getTravelerDriverBookings(travelerId)
    ]);

    return {
      guideReservations,
      hotelBookings,
      driverBookings
    };
  } catch (error) {
    console.error(`Error fetching all bookings for traveler ${travelerId}:`, error);
    throw error;
  }
};

/**
 * Get specific booking counts for a traveler
 * @param {number} travelerId - The traveler's ID
 * @returns {Promise} - Promise containing booking counts
 */
export const getTravelerBookingCounts = async (travelerId) => {
  try {
    const allBookings = await getAllTravelerBookings(travelerId);
    
    return {
      guideReservationsCount: allBookings.guideReservations.length,
      hotelBookingsCount: allBookings.hotelBookings.length,
      driverBookingsCount: allBookings.driverBookings.length,
      totalBookings: allBookings.guideReservations.length + 
                    allBookings.hotelBookings.length + 
                    allBookings.driverBookings.length
    };
  } catch (error) {
    console.error(`Error fetching booking counts for traveler ${travelerId}:`, error);
    throw error;
  }
};