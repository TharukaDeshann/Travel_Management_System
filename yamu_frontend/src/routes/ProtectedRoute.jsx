import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import apiClient from "../services/axiosInstance"; // Use axios instance for requests

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiClient.get("/api/users/user"); // API call to verify session
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>; // Wait for API response

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
