import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import apiClient from "../services/axiosInstance"; // Use axios instance for requests

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // This request will automatically trigger token refresh if needed
        // through the axios interceptors in axiosInstance
        const response = await apiClient.get("/api/auth/user");
        setIsAuthenticated(true);
      } catch (error) {
        // This will only happen if both token and refresh token are invalid
        // or if there was a network error
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // After loading completes, either show protected content or redirect
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;