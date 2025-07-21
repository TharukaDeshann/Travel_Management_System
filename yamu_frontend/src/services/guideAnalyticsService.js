import apiClient from "./axiosInstance";

// Existing functions - keeping unchanged
export const getGuideReservations = async (guideId) => {
  try {
    const response = await apiClient.get(`/api/admin/guides/${guideId}/guide-reservations`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching guide reservations for guide ${guideId}:`, error);
    throw error;
  }
}

export const getGuideReviews = async (guideId) => {
  try {
    const response = await apiClient.get(`/api/admin/guides/${guideId}/guide-reviews`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for guide ${guideId}:`, error);
    throw error;
  }
}

export const getGuideAverageRating = async (guideId) => {
  try {
    const response = await apiClient.get(`/api/admin/guides/${guideId}/average-rating`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching average rating for guide ${guideId}:`, error);
    throw error;
  }
}

export const getAllGuides = async () => {
  try {
    const response = await apiClient.get('/api/admin/guides/role/GUIDE');
    return response.data;
  } catch (error) {
    console.error('Error fetching all guides:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/api/admin/guides/${userId}/delete-user`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

export const deleteGuideReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/api/admin/guides/${reviewId}/delete-review`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
};

// Additional utility functions for enhanced analytics

/**
 * Get paginated reviews for a guide with page and size parameters
 * @param {number} guideId - The guide's ID
 * @param {number} page - Page number (optional)
 * @param {number} size - Page size (optional)
 * @returns {Promise} - Promise resolving to paginated reviews
 */
export const getGuideReviewsPaginated = async (guideId, page = null, size = null) => {
  try {
    let url = `/api/admin/guides/${guideId}/guide-reviews`;
    const params = new URLSearchParams();
    
    if (page !== null) params.append('page', page);
    if (size !== null) params.append('size', size);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching paginated reviews for guide ${guideId}:`, error);
    throw error;
  }
};

/**
 * Get comprehensive analytics data for a specific guide
 * @param {number} guideId - The guide's ID
 * @returns {Promise} - Promise resolving to comprehensive guide analytics
 */
export const getGuideAnalytics = async (guideId) => {
  try {
    const [reservations, reviews, averageRating] = await Promise.all([
      getGuideReservations(guideId),
      getGuideReviews(guideId),
      getGuideAverageRating(guideId)
    ]);

    return {
      guideId,
      reservations,
      reviews,
      averageRating,
      totalReservations: reservations.length,
      totalReviews: reviews.length,
      analysisDate: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching comprehensive analytics for guide ${guideId}:`, error);
    throw error;
  }
};

/**
 * Get analytics for all guides in the system
 * @returns {Promise} - Promise resolving to all guides with their basic analytics
 */
export const getAllGuidesAnalytics = async () => {
  try {
    const guides = await getAllGuides();
    
    const analyticsPromises = guides.map(async (guide) => {
      try {
        const [averageRating, reviews, reservations] = await Promise.all([
          getGuideAverageRating(guide.id),
          getGuideReviews(guide.id),
          getGuideReservations(guide.id)
        ]);

        return {
          ...guide,
          averageRating,
          totalReviews: reviews.length,
          totalReservations: reservations.length,
          lastAnalyzed: new Date().toISOString()
        };
      } catch (error) {
        console.warn(`Failed to get analytics for guide ${guide.id}:`, error);
        return {
          ...guide,
          averageRating: null,
          totalReviews: 0,
          totalReservations: 0,
          lastAnalyzed: new Date().toISOString(),
          error: true
        };
      }
    });

    const results = await Promise.all(analyticsPromises);
    return results;
  } catch (error) {
    console.error('Error fetching analytics for all guides:', error);
    throw error;
  }
};

/**
 * Get guides filtered by rating threshold (useful for identifying underperforming guides)
 * @param {number} minRating - Minimum rating threshold (default: 3.0)
 * @returns {Promise} - Promise resolving to guides below the rating threshold
 */
export const getUnderperformingGuides = async (minRating = 3.0) => {
  try {
    const allGuidesAnalytics = await getAllGuidesAnalytics();
    
    return allGuidesAnalytics.filter(guide => 
      guide.averageRating !== null && 
      guide.averageRating < minRating &&
      guide.totalReviews > 0 // Only include guides with at least one review
    ).sort((a, b) => a.averageRating - b.averageRating); // Sort by rating ascending (worst first)
  } catch (error) {
    console.error('Error fetching underperforming guides:', error);
    throw error;
  }
};

/**
 * Get top performing guides based on rating and review count
 * @param {number} limit - Number of top guides to return (default: 10)
 * @param {number} minReviews - Minimum number of reviews required (default: 5)
 * @returns {Promise} - Promise resolving to top performing guides
 */
export const getTopPerformingGuides = async (limit = 10, minReviews = 5) => {
  try {
    const allGuidesAnalytics = await getAllGuidesAnalytics();
    
    return allGuidesAnalytics
      .filter(guide => 
        guide.averageRating !== null && 
        guide.totalReviews >= minReviews
      )
      .sort((a, b) => {
        // Sort by rating descending, then by review count descending
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.totalReviews - a.totalReviews;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top performing guides:', error);
    throw error;
  }
};

/**
 * Generate analytics summary for admin dashboard
 * @returns {Promise} - Promise resolving to analytics summary
 */
export const getAnalyticsSummary = async () => {
  try {
    const allGuidesAnalytics = await getAllGuidesAnalytics();
    
    const totalGuides = allGuidesAnalytics.length;
    const guidesWithReviews = allGuidesAnalytics.filter(g => g.totalReviews > 0);
    const totalReviews = allGuidesAnalytics.reduce((sum, guide) => sum + guide.totalReviews, 0);
    const totalReservations = allGuidesAnalytics.reduce((sum, guide) => sum + guide.totalReservations, 0);
    
    const validRatings = allGuidesAnalytics
      .filter(g => g.averageRating !== null)
      .map(g => g.averageRating);
    
    const averageSystemRating = validRatings.length > 0 
      ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length 
      : 0;

    const underperformingCount = allGuidesAnalytics.filter(g => 
      g.averageRating !== null && g.averageRating < 3.0 && g.totalReviews > 0
    ).length;

    return {
      totalGuides,
      guidesWithReviews: guidesWithReviews.length,
      totalReviews,
      totalReservations,
      averageSystemRating: Math.round(averageSystemRating * 100) / 100,
      underperformingGuidesCount: underperformingCount,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    throw error;
  }
};