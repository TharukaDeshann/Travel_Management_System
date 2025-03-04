import axios from "axios";
import { logoutUser, refreshToken } from "./authService";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Ensures cookies are sent automatically
});

// Remove manual token attachment since cookies handle authentication
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 (Unauthorized) errors by attempting a token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await refreshToken(); // This will update the cookie automatically
        return apiClient(error.config); // Retry the failed request
      } catch (refreshError) {
        logoutUser(); // If refresh fails, log the user out
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
