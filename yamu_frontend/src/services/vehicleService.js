// services/vehicleService.js
import axios from 'axios';
// Import your authenticated axios instance
import apiClient from './axiosInstance';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// Vehicle API service
export const vehicleService = {
  // Get vehicles by guide ID (public access)
  getVehiclesByGuideId: async (guideId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/guide/vehicles/${guideId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  },

  // Add vehicle (protected - requires GUIDE role)
  addVehicle: async (vehicleData) => {
    try {
      const response = await apiClient.post('/api/guide/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw new Error(error.response?.data?.message || 'Failed to add vehicle');
    }
  },

  // Update vehicle (protected - requires GUIDE role)
  updateVehicle: async (vehicleId, vehicleData) => {
    try {
      const response = await apiClient.put(`/api/guide/vehicles/${vehicleId}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw new Error(error.response?.data?.message || 'Failed to update vehicle');
    }
  },

  // Delete vehicle (protected - requires GUIDE role)
  deleteVehicle: async (vehicleId) => {
    try {
      const response = await apiClient.delete(`/api/guide/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  }
};

export default vehicleService;