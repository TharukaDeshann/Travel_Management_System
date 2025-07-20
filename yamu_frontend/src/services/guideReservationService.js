import apiClient from "./axiosInstance";

export const getGuideReservationByDayPlan = async (dayPlanId) => {
  const res = await apiClient.get(`/api/reservations/by-dayplan/${dayPlanId}`);
  return res.data;
}; 