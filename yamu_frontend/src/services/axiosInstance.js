import axios from "axios";
import { getAccessToken, logoutUser, refreshToken } from "./authService";

const apiClient = axios.create({
    baseURL: "http://localhost:8080",
});

// Attach token to all requests
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response.status === 401) {
        const newToken = await refreshToken();
  
        if (newToken) {
          error.config.headers["Authorization"] = `Bearer ${newToken}`;
          return apiClient(error.config);
        } else {
          logoutUser();
        }
      }
  
      return Promise.reject(error);
    }
  );

export default apiClient;
