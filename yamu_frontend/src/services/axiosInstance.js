import axios from "axios";
import { logoutUser, refreshToken } from "./authService";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Ensures cookies are sent automatically
});

// Track if a token refresh is already in progress
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

// Process failed queue - resolve or reject based on refresh success
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

// Calculate token expiration time - we'll proactively refresh before it expires
let tokenExpirationTime = null;
const setTokenExpiration = () => {
  // Set expiration to 55 seconds from now (for 60-second tokens)
  tokenExpirationTime = Date.now() + 55 * 1000;
};

// Initial token expiration time if user is already logged in
setTokenExpiration();

// Check if token needs refresh before each request
apiClient.interceptors.request.use(
  async (config) => {
    // If token is about to expire, refresh it before proceeding
    if (tokenExpirationTime && Date.now() > tokenExpirationTime && !isRefreshing) {
      isRefreshing = true;
      
      try {
        await refreshToken();
        // Reset expiration timer after successful refresh
        setTokenExpiration();
        isRefreshing = false;
      } catch (error) {
        isRefreshing = false;
        // If refresh fails, user will be logged out in the response interceptor
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors for cases where token validation fails on server
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and request hasn't been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshToken();
        setTokenExpiration();
        processQueue(null);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        logoutUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;