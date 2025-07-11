import axios from "axios";

// Create Axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Allow sending cookies (optional for refresh-token/logout)
});

// 🔒 Attach token to every request if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
