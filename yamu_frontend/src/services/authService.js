import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;  
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials, {
    withCredentials: true, // Ensures cookies are set
  });
  
  console.log("Response: " + JSON.stringify(response, null, 2));
  return response;
};

export const refreshToken = async () => {
  

  try {
    const response = await axios.post(`${API_URL}/refresh-token`, {}, {
      withCredentials: true, // Ensures cookies are set
    });
    
    
    return response.data;
  } catch (error) {
    logoutUser(); // If refresh token is invalid, force logout
  }
};

// Logout User
export const logoutUser = async () => {
  

 
  
 
    try {
      await axios.post(
        `${API_URL}/logout`, 
        {}, 
        {
          withCredentials: true, 
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }
  
  
  
  window.location.href = "/login"; // Redirect to login page
};


