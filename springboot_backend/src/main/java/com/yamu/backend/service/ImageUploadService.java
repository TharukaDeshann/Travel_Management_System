package com.yamu.backend.service;
import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;

@Service
public class ImageUploadService {

    private final Cloudinary cloudinary;
    private final UserRepository userRepository;

    public ImageUploadService(Cloudinary cloudinary, UserRepository userRepository) {
        this.userRepository = userRepository;
        this.cloudinary = cloudinary;
    }

    /**
     * Upload user profile image to Cloudinary
     */
    public String uploadProfileImage(Long userId, MultipartFile imageFile) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), Map.of(
                "folder", "user_profiles", // Optional folder name
                "public_id", "user_" + userId, // Optional: unique ID
                "overwrite", true
            ));

            String imageUrl = (String) uploadResult.get("secure_url");
            user.setProfileImageUrl(imageUrl);
            userRepository.save(user);

            return imageUrl;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}
