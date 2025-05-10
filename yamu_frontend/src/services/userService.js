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




export default {
  updateEmail,
  updatePassword,
  fetchUsersByRole,
  fetchUserById,
};