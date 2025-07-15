// services/guideSearchService.js
import apiClient from './axiosInstance'; // Assuming you have an existing apiClient

class GuideSearchService {
  constructor() {
    this.baseURL = '/api/search/guides';
  }

  // Main search endpoint for guides
  async searchGuides(params = {}) {
    try {
      const response = await apiClient.get(this.baseURL, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching guides:', error);
      throw error;
    }
  }

  // Search guides by specific places
  async searchGuidesByPlaces(places, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/by-places`, {
        params: { places, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching guides by places:', error);
      throw error;
    }
  }

  // Get top-rated guides
  async getTopRatedGuides(minRating = 4, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/top-rated`, {
        params: { minRating, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top-rated guides:', error);
      throw error;
    }
  }

  // Get guides with available vehicles
  async getGuidesWithAvailableVehicles(params = {}) {
    try {
      const response = await apiClient.get(`${this.baseURL}/available-vehicles`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error getting guides with available vehicles:', error);
      throw error;
    }
  }

  // Get specific guide by ID
  async getGuideById(guideId) {
    try {
      const response = await apiClient.get(`${this.baseURL}/${guideId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting guide by ID:', error);
      throw error;
    }
  }

  // Get suggestions for autocomplete
  async getSuggestions(query) {
    try {
      const response = await apiClient.get(`${this.baseURL}/suggestions`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }

  // Get faceted search results
  async getFacetedSearch(query = '*', page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/faceted`, {
        params: { query, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting faceted search:', error);
      throw error;
    }
  }

  // Search guides by region
  async searchGuidesByRegion(region, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/by-region`, {
        params: { region, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching guides by region:', error);
      throw error;
    }
  }

  // Search guides by language
  async searchGuidesByLanguage(language, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/by-language`, {
        params: { language, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching guides by language:', error);
      throw error;
    }
  }


  // Get guides by reservation status
  async getGuidesByReservationStatus(status, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/by-reservation-status`, {
        params: { status, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting guides by reservation status:', error);
      throw error;
    }
  }

  // Get guides with upcoming reservations
  async getGuidesWithUpcomingReservations(page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/upcoming-reservations`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting guides with upcoming reservations:', error);
      throw error;
    }
  }

  // Get most experienced guides
  async getMostExperiencedGuides(minCompletedReservations = 5, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/most-experienced`, {
        params: { minCompletedReservations, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting most experienced guides:', error);
      throw error;
    }
  }

  // Get guides with multiple vehicles
  async getGuidesWithMultipleVehicles(minVehicles = 2, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`${this.baseURL}/multi-vehicle`, {
        params: { minVehicles, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting guides with multiple vehicles:', error);
      throw error;
    }
  }

  // Advanced search with multiple criteria
  async advancedSearch(searchRequest) {
    try {
      const response = await apiClient.post(`${this.baseURL}/advanced-search`, searchRequest);
      return response.data;
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  }

  // Get aggregated statistics
  async getGuideStats() {
    try {
      const response = await apiClient.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting guide stats:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await apiClient.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

export default new GuideSearchService();