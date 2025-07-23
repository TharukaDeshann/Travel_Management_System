import apiClient from './axiosInstance';

// Main search endpoint for guides
export const searchGuides = async (params) => {
  const response = await apiClient.get('/api/search/guides', { params });
  return response.data;
};

// Search guides by specific places
export const searchGuidesByPlaces = async (params) => {
  const response = await apiClient.get('/api/search/guides/by-places', { params });
  return response.data;
};

// Get guides with highest ratings
export const getTopRatedGuides = async (params) => {
  const response = await apiClient.get('/api/search/guides/top-rated', { params });
  return response.data;
};

// Get guides with available vehicles
export const getGuidesWithAvailableVehicles = async (params) => {
  const response = await apiClient.get('/api/search/guides/available-vehicles', { params });
  return response.data;
};

// Get faceted search results
export const getFacetedSearch = async (params) => {
  const response = await apiClient.get('/api/search/guides/faceted', { params });
  return response.data;
};

// Search guides by expertise/region
export const searchGuidesByRegion = async (params) => {
  const response = await apiClient.get('/api/search/guides/by-region', { params });
  return response.data;
};

// Search guides by language
export const searchGuidesByLanguage = async (params) => {
  const response = await apiClient.get('/api/search/guides/by-language', { params });
  return response.data;
};

// Get guides with specific reservation status
export const getGuidesByReservationStatus = async (params) => {
  const response = await apiClient.get('/api/search/guides/by-reservation-status', { params });
  return response.data;
};

// Get guides with upcoming reservations
export const getGuidesWithUpcomingReservations = async (params) => {
  const response = await apiClient.get('/api/search/guides/upcoming-reservations', { params });
  return response.data;
};

// Get most experienced guides (based on completed reservations)
export const getMostExperiencedGuides = async (params) => {
  const response = await apiClient.get('/api/search/guides/most-experienced', { params });
  return response.data;
};

// Get guides with multiple vehicles
export const getGuidesWithMultipleVehicles = async (params) => {
  const response = await apiClient.get('/api/search/guides/multi-vehicle', { params });
  return response.data;
};

// Advanced search with multiple criteria
export const advancedSearch = async (requestBody) => {
  const response = await apiClient.post('/api/search/guides/advanced-search', requestBody);
  return response.data;
};

// Get aggregated statistics
export const getGuideStats = async () => {
  const response = await apiClient.get('/api/search/guides/stats');
  return response.data;
};

