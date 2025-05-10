import React, { useState } from "react";
import { uploadImage } from "../services/imageUploadService";
import { useNotification } from "../hooks/useNotification";
import { useUser } from "../context/UserContext";
import { Button } from "./StyledComponents";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const ProfileImageUploader = () => {
  const { user, setUser } = useUser();
  const { showSuccess, showError } = useNotification();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showError("Only JPG, JPEG, or PNG images are allowed.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showError("File size should be less than 5MB.");
      return;
    }

    setSelectedImage(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return showError("Please select an image.");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await uploadImage(formData);
      setUser({ ...user, profileImage: response.imageUrl });
      showSuccess("Profile image updated successfully!");
      setSelectedImage(null);
    } catch (error) {
      showError(error.response?.data?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {selectedImage && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%" }}
          />
        </div>
      )}
      <Button onClick={handleImageUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload New Image"}
      </Button>
    </div>
  );
};

export default ProfileImageUploader;
