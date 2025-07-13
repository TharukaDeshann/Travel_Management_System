import apiClient from './axiosInstance';

// Transportation/Driver booking service
export const transportationService = {
  // Get available drivers for a specific date
  getAvailableDrivers: async (date) => {
    try {
      const response = await apiClient.get(`/api/drivers/available?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch available drivers');
    }
  },

  // Get driver details by ID
  getDriverDetails: async (driverId) => {
    try {
      const response = await apiClient.get(`/api/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch driver details');
    }
  },

  // Book a driver
  bookDriver: async (bookingData) => {
    try {
      const response = await apiClient.post('/api/drivers/book', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking driver:', error);
      throw new Error(error.response?.data?.message || 'Failed to book driver');
    }
  },

  // Cancel driver booking
  cancelDriverBooking: async (cancelData) => {
    try {
      const response = await apiClient.post('/api/drivers/cancel', cancelData);
      return response.data;
    } catch (error) {
      console.error('Error cancelling driver booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },

  // Get traveler's driver bookings (mock implementation - you may need to add this to backend)
  getTravelerBookings: async (travelerId) => {
    try {
      // This endpoint might need to be implemented in the backend
      const response = await apiClient.get(`/api/drivers/bookings/traveler/${travelerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching traveler bookings:', error);
      // Return empty array for now if endpoint doesn't exist
      return [];
    }
  }
};

export default transportationService;
