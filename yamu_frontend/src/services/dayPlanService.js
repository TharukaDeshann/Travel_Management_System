import apiClient from './axiosInstance';

export const createDayPlan = async (itineraryId, dayPlanData) => {
    try {
        const response = await apiClient.post(`/api/day-plans/itinerary/${itineraryId}`, dayPlanData);
        return response.data;
    } catch (error) {
        console.error('Error creating day plan:', error);
        throw error;
    }
}; 