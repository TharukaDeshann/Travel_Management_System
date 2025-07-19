import apiClient from './axiosInstance';

// Package Management Service
export const packageService = {
  // Admin Package CRUD Operations

  // Get all packages (admin view)
  getAllPackages: async () => {
    try {
      console.log('📦 Fetching all packages for admin...');
      const response = await apiClient.get('/api/packages');
      console.log('✅ Packages fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching packages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch packages');
    }
  },

  // Get package statistics
  getPackageStatistics: async () => {
    try {
      console.log('📊 Fetching package statistics...');
      const response = await apiClient.get('/api/admin/packages/statistics');
      console.log('✅ Statistics fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  // Get package by ID
  getPackageById: async (packageId) => {
    try {
      console.log(`📦 Fetching package with ID: ${packageId}`);
      const response = await apiClient.get(`/api/packages/${packageId}`);
      console.log('✅ Package fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching package:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch package');
    }
  },

  // Create new package
  createPackage: async (packageData) => {
    try {
      console.log('🆕 Creating new package:', packageData);
      const response = await apiClient.post('/api/packages', packageData);
      console.log('✅ Package created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating package:', error);
      throw new Error(error.response?.data?.message || 'Failed to create package');
    }
  },

  // Update existing package
  updatePackage: async (packageId, packageData) => {
    try {
      console.log(`🔄 Updating package ${packageId}:`, packageData);
      const response = await apiClient.put(`/api/packages/${packageId}`, packageData);
      console.log('✅ Package updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating package:', error);
      throw new Error(error.response?.data?.message || 'Failed to update package');
    }
  },

  // Delete package
  deletePackage: async (packageId) => {
    try {
      console.log(`🗑️ Deleting package with ID: ${packageId}`);
      const response = await apiClient.delete(`/api/packages/${packageId}`);
      console.log('✅ Package deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting package:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete package');
    }
  },

  // Package Application Management

  // Get all applications for a package
  getPackageApplications: async (packageId) => {
    try {
      console.log(`📋 Fetching applications for package: ${packageId}`);
      const response = await apiClient.get(`/api/packages/admin/applications/${packageId}`);
      console.log('✅ Applications fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
  },

  // Get all pending applications
  getPendingApplications: async () => {
    try {
      console.log('⏳ Fetching pending applications...');
      const response = await apiClient.get('/api/packages/admin/applications/pending');
      console.log('✅ Pending applications fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching pending applications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pending applications');
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId, status, adminNotes = '') => {
    try {
      console.log(`🔄 Updating application ${applicationId} status to: ${status}`);
      const response = await apiClient.put(`/api/packages/admin/applications/${applicationId}/status`, {
        status,
        adminNotes
      });
      console.log('✅ Application status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update application status');
    }
  },

  // Bulk approve applications
  bulkApproveApplications: async (applicationIds) => {
    try {
      console.log('✅ Bulk approving applications:', applicationIds);
      const response = await apiClient.post('/api/packages/admin/applications/bulk-approve', {
        applicationIds
      });
      console.log('✅ Applications approved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error bulk approving applications:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve applications');
    }
  },

  // Resource Management for Packages

  // Get available hotels
  getAvailableHotels: async () => {
    try {
      console.log('🏨 Fetching available hotels...');
      const response = await apiClient.get('/api/admin/packages/resources/hotels');
      console.log('✅ Hotels fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching hotels:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch hotels');
    }
  },

  // Get available drivers with their vehicle details
  getAvailableDrivers: async () => {
    try {
      console.log('👨‍✈️ Fetching available drivers with vehicle details...');
      const response = await apiClient.get('/api/drivers/all');
      console.log('✅ Drivers with vehicles fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching drivers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch drivers');
    }
  },

  // Traveler Package Operations

  // Get active packages (public view)
  getActivePackages: async () => {
    try {
      console.log('📦 Fetching active packages...');
      const response = await apiClient.get('/api/packages/active');
      console.log('✅ Active packages fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching active packages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch active packages');
    }
  },

  // Apply for a package
  applyForPackage: async (packageId, applicationData) => {
    try {
      console.log(`📝 Applying for package ${packageId}:`, applicationData);
      const response = await apiClient.post(`/api/packages/${packageId}/apply`, applicationData);
      console.log('✅ Application submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error applying for package:', error);
      throw new Error(error.response?.data?.message || 'Failed to apply for package');
    }
  },

  // Get traveler's applications
  getTravelerApplications: async (travelerId) => {
    try {
      console.log(`📋 Fetching applications for traveler: ${travelerId}`);
      const response = await apiClient.get(`/api/packages/applications/traveler/${travelerId}`);
      console.log('✅ Traveler applications fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching traveler applications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
  },

  // Utility functions

  // Format package data for display
  formatPackageForDisplay: (packageData) => {
    return {
      ...packageData,
      formattedBudget: new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
      }).format(packageData.budgetPerPerson || 0),
      formattedDuration: `${packageData.durationDays} ${packageData.durationDays === 1 ? 'day' : 'days'}`,
      statusColor: getStatusColor(packageData.status),
      isActive: packageData.status === 'ACTIVE'
    };
  },

  // Validate package data
  validatePackageData: (packageData) => {
    const errors = [];
    
    if (!packageData.packageName || packageData.packageName.trim().length === 0) {
      errors.push('Package name is required');
    }
    
    if (!packageData.description || packageData.description.trim().length === 0) {
      errors.push('Package description is required');
    }
    
    if (!packageData.durationDays || packageData.durationDays < 1) {
      errors.push('Duration must be at least 1 day');
    }
    
    if (!packageData.budgetPerPerson || packageData.budgetPerPerson <= 0) {
      errors.push('Budget per person must be greater than 0');
    }
    
    if (!packageData.dayPlans || packageData.dayPlans.length === 0) {
      errors.push('At least one day plan is required');
    }
    
    if (packageData.dayPlans && packageData.dayPlans.length !== packageData.durationDays) {
      errors.push('Number of day plans must match duration');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-600 bg-green-100';
    case 'INACTIVE':
      return 'text-gray-600 bg-gray-100';
    case 'DRAFT':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Export individual functions for convenience
export const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  getPackageApplications,
  updateApplicationStatus,
  getActivePackages,
  applyForPackage,
  getTravelerApplications
} = packageService;

export default packageService;
