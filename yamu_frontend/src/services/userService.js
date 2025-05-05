import axios from "./axiosInstance";
import { fetchLoggedInUser } from "./authService";



export const updateUser = async (id, data) => {
  const res = await axios.put(`/api/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`/api/users/${id}`);
  return res.data;
};

export const updateEmail = async (data) => {
  const user = await fetchLoggedInUser();
  const id = user.id; 
  const res = await axios.put(`/api/users/${id}/update-email`, data);
  return res;
};

export const updatePassword = async (data) => {
  const user = await fetchLoggedInUser();
  const id = user.id;
  const res = await axios.put(`/api/users/${id}/update-password`, data);
  return res;
};
