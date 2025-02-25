import axios from "axios";
import { getToken } from "../services/authService";

const apiClient = axios.create({
    baseURL: "http://localhost:8080",
});

// Attach token to all requests
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;
