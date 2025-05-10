import apiClient from "./axiosInstance";
import { fetchLoggedInUser } from "./authService";

export const uploadImage = async (formData) => {
  try {
    const user = await fetchLoggedInUser();
    const id = user.id;
    const response = await apiClient.put(
      `/api/users/${id}/profile-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
