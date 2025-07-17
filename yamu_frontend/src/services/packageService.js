import apiClient from './axiosInstance';

const packageService = {
  // Admin package management
  createPackage: async (packageData, adminId) => {
    const response = await apiClient.post(`/api/admin/packages?adminId=${adminId}`, packageData);
    return response.data;
  },

  getAllPackages: async () => {
    const response = await apiClient.get('/api/admin/packages');
    return response.data;
  },

  getPackageById: async (id) => {
    const response = await apiClient.get(`/api/admin/packages/${id}`);
    return response.data;
  },

  updatePackage: async (id, packageData) => {
    const response = await apiClient.put(`/api/admin/packages/${id}`, packageData);
    return response.data;
  },

  deletePackage: async (id) => {
    const response = await apiClient.delete(`/api/admin/packages/${id}`);
    return response.data;
  },

  searchPackages: async (params) => {
    const queryParams = new URLSearchParams();
    if (params.mainAttraction) queryParams.append('mainAttraction', params.mainAttraction);
    if (params.category) queryParams.append('category', params.category);
    if (params.minBudget) queryParams.append('minBudget', params.minBudget);
    if (params.maxBudget) queryParams.append('maxBudget', params.maxBudget);
    
    const response = await apiClient.get(`/api/admin/packages/search?${queryParams.toString()}`);
    return response.data;
  },

  getActivePackages: async () => {
    const response = await apiClient.get('/api/admin/packages/active');
    return response.data;
  }
};

export default packageService; 