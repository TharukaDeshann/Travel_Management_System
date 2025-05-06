import axios from "./axiosInstance";
import { fetchLoggedInUser } from "./authService";
import { useUser } from "../context/UserContext.jsx";




export const updateEmail = async (data) => {
  const user = await fetchLoggedInUser();
  const id = user.id; 
  const res = await axios.put(`/api/users/${id}/update-email`, data);
  return res;
};

export const updatePassword = async (data) => {
  const user = await fetchLoggedInUser();
  const id = user.id;
  console.log("User ID:", id); // Debugging line to check user ID
  const res = await axios.put(`/api/users/${id}/update-password`, data);
  return res;
};
