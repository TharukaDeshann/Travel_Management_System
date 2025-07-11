import axios from "axios";
import apiClient from "./axiosInstance";

const API_URL = "http://localhost:8080/api/auth";

// Save token in localStorage
const saveAccessToken = (token) => {
  localStorage.setItem("accessToken", token);
};

const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// 1️⃣ Register user
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// 2️⃣ Login user and save token to localStorage
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials, {
    withCredentials: true,
  });

  if (response.data.accessToken) {
    saveAccessToken(response.data.accessToken);
  }

  return response.data;
};

// 3️⃣ Fetch logged-in user using token from localStorage
export const fetchLoggedInUser = async () => {
  const token = getAccessToken();

  if (!token) throw new Error("No access token found");

  const response = await apiClient.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// 4️⃣ Refresh token (optional - not used if storing in localStorage)
export const refreshToken = async () => {
  const response = await axios.post(`${API_URL}/refresh-token`, {}, {
    withCredentials: true,
  });

  if (response.data.accessToken) {
    saveAccessToken(response.data.accessToken);
  }

  return response.data;
};

// 5️⃣ Logout user
export const logoutUser = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, {
      withCredentials: true,
    });
    localStorage.removeItem("accessToken");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// 6️⃣ Check login status
export const isLoggedIn = () => {
  const token = getAccessToken();
  return !!token;
};

// 7️⃣ Export token for other services like dayPlanService
export const getStoredToken = getAccessToken;
