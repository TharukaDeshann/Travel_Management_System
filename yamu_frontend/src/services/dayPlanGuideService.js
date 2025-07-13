import apiClient from './axiosInstance';

export const linkGuideReservationToDayPlan = async (dayPlanId, guideReservationId, guideReservationDayDetailId) => {
    try {
        const response = await apiClient.post('/api/day-plan-guides/link', {
            dayPlanId,
            guideReservationId,
            guideReservationDayDetailId
        });
        return response.data;
    } catch (error) {
        console.error('Error linking guide reservation to day plan:', error);
        throw error;
    }
};

export const getGuideReservationByDayPlan = async (dayPlanId) => {
    try {
        const response = await apiClient.get(`/api/day-plan-guides/day-plan/${dayPlanId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting guide reservation for day plan:', error);
        throw error;
    }
}; 