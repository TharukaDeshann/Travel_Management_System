import axios from "axios";
const API_URL = "http://localhost:8080/api/auth";
import apiClient from "./axiosInstance";

// Register
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData, { withCredentials: true });
  return response.data;
};

// Login
export const login = async (credentials) => {
  // No need to handle tokens, just let cookies be set
  const response = await axios.post(`${API_URL}/login`, credentials, { withCredentials: true });
  return response.data;
};

// Fetch logged-in user
export const fetchLoggedInUser = async () => {
  const response = await apiClient.get(`${API_URL}/me`, { withCredentials: true });
  return response.data;
};

// Refresh token
export const refreshToken = async () => {
  const response = await axios.post(`${API_URL}/refresh-token`, {}, { withCredentials: true });
  return response.data;
};

// Logout
export const logoutUser = async () => {
  await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
};

// Check login status (optional, just try fetchLoggedInUser and handle 401)
export const isLoggedIn = async () => {
  try {
    await fetchLoggedInUser();
    return true;
  } catch {
    return false;
  }
};
