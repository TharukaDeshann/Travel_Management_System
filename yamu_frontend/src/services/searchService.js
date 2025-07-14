
import axios from 'axios';
import apiClient from './axiosInstance';

const API_BASE_URL = 'http://localhost:8080/api/search';

export const searchUsers = async (params) => {
  const response = await apiClient.get(`${API_BASE_URL}/users`, { params });
  return response.data;
};

export const getSuggestions = async (query) => {
  const response = await apiClient.get(`${API_BASE_URL}/suggestions`, {
    params: { query }
  });
  return response.data;
};
