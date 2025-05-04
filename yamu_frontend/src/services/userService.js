import axios from "./axiosInstance";

const API_URL = "http://localhost:8080/api/users";


export const updateUser = async (id, data) => {
  const res = await axios.put(`/api/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`/api/users/${id}`);
  return res.data;
};

export const updateEmail = async (id, data) => {
  const res = await axios.put(`/api/users/${id}/update-email`, data);
  return res.data;
};

export const updatePassword = async (id, data) => {
  const res = await axios.put(`/api/users/${id}/update-password`, data);
  return res.data;
};
