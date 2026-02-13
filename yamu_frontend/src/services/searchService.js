import axios from "axios";
import apiClient from "./axiosInstance";

export const searchUsers = async (params) => {
  const response = await apiClient.get(`/api/search/users`, { params });
  return response.data;
};

export const getSuggestions = async (query) => {
  const response = await apiClient.get(`/api/search/suggestions`, {
    params: { query },
  });
  return response.data;
};

export const getPublicSuggestions = async (query) => {
  const response = await apiClient.get(`/api/suggestions`, {
    params: { query },
  });
  return response.data;
};
