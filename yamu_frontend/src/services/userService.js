import apiClient from "./axiosInstance";
import { fetchLoggedInUser } from "./authService";

// Update user email
export const updateEmail = async (data) => {
  const user = await fetchLoggedInUser();
  const id = user.id;
  const res = await apiClient.put(`/api/users/${id}/update-email`, data);
  return res;
};

// Update user password
export const updatePassword = async (data) => {
  const user = await fetchLoggedInUser();
  const id = user.id;
  const res = await apiClient.put(`/api/users/${id}/update-password`, data);
  return res;
};

// Update user details
export const UpdateUserDetails = async (userId, data) => {
  try {
    const response = await apiClient.put(`api/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
}

// Fetch users by role
export const fetchUsersByRole = async (role) => {
  try {
    const response = await apiClient.get(`/api/users/role/${role}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};

// Fetch user details by ID
export const fetchUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const fetchTravelersAndGuides = async () => {
  try {
    const response = await apiClient.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};







export default {
  updateEmail,
  updatePassword,
  fetchUsersByRole,
  fetchUserById,
};