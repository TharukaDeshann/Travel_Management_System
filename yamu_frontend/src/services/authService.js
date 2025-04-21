import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

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
  console.log("Logging in with credentials:", credentials);
  const response = await axios.post(`${API_URL}/login`, credentials, {
    withCredentials: true, // Ensures cookies are set
  });
  
  // Set token expiration time (60 seconds from now)
  setTokenExpirationTime(60);
  
  return response;
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
    await axios.post(
      `${API_URL}/logout`, 
      {}, 
      {
        withCredentials: true, 
      }
    );
    
    // Clear token expiration
    window.tokenExpirationTime = null;
    
  } catch (error) {
    console.error("Logout error:", error);
  }
  
  // Redirect to login page
  window.location.href = "/login";
};

// Add function to check if user is logged in
export const isLoggedIn = () => {
  return window.tokenExpirationTime && window.tokenExpirationTime > Date.now();
};