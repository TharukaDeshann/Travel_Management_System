import axios from "axios";
import { useUser } from "../context/UserContext.jsx"; // Importing useUser from context
const API_URL = "http://localhost:8080/api/auth";
import apiClient from "./axiosInstance"; // Importing axios instance

// Function to expose token expiration to other modules
export const getTokenExpirationTime = () => {
  return window.tokenExpirationTime || null;
};

export const setTokenExpirationTime = (expiresIn = 60) => {
  // Set expiration time in browser memory (seconds)
  window.tokenExpirationTime = Date.now() + (expiresIn * 1000);
};

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;  
};

export const login = async (credentials) => {
  console.log("Credentials:", JSON.stringify(credentials));
  const response = await axios.post(`${API_URL}/login`, credentials, {
    withCredentials: true, 
  });
  
  // Set token expiration time (60 seconds from now)
  setTokenExpirationTime(60);
  
  return response;
};

export const fetchLoggedInUser = async () => {
  const response = await apiClient.get(`${API_URL}/current-user`, {
    withCredentials: true,
  });
  return response.data;

};






export const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/refresh-token`, {}, {
      withCredentials: true, // Ensures cookies are sent
    });
    
    // Reset expiration timer after successful refresh
    setTokenExpirationTime(60);
    
    return response.data;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error; // Rethrow to be handled by the interceptor
  }
};

export const logoutUser = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    window.tokenExpirationTime = null;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};


// Add function to check if user is logged in
export const isLoggedIn = () => {
  return window.tokenExpirationTime && window.tokenExpirationTime > Date.now();
};