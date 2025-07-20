import axios from "axios";

// Create Axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Always send cookies
});

export default apiClient;
