import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;  
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  console.log(response.data);
  console.log("Access Token : " + response.data.accessToken + "\nRefresh Token : " + response.data.refreshToken);
  if(response.data.accessToken && response.data.refreshToken){
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
  }
  
  return response;
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    logoutUser();
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
    
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }

    return response.data.accessToken;
  } catch (error) {
    logoutUser(); // If refresh token is invalid, force logout
  }
};

// Logout User
export const logoutUser = async () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  console.log("tokens : " + accessToken + " " + refreshToken);
  
  if(accessToken && refreshToken) {
    try {
      await axios.post(
        `${API_URL}/logout`, 
        { refreshToken }, 
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken"); 
  window.location.href = "/login"; // Redirect to login page
};

// Get Access Token
export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// Get Refresh Token
export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};
