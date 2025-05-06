package com.yamu.backend.service;

import com.yamu.backend.dto.AdminResponseDTO;
import com.yamu.backend.dto.GuideResponseDTO;
import com.yamu.backend.dto.TravelerResponseDTO;
import com.yamu.backend.dto.UserResponseDTO;
import com.yamu.backend.dto.UserUpdateRequest;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.Admin;
import com.yamu.backend.model.Guide;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    // Convert entity to correct dto based on role
    public UserResponseDTO mapToUserDTO(User user) {
        UserResponseDTO baseDto;

        switch (user.getRole()) {
            case TRAVELER -> {
                // Traveler-specific mapping
                Traveler traveler = (Traveler) user;
                TravelerResponseDTO travelerDto = new TravelerResponseDTO();
                travelerDto.setNationality(traveler.getNationality());
                baseDto = travelerDto;
            }

            case GUIDE -> {
                // Guide-specific mapping
                Guide guide = (Guide) user;
                GuideResponseDTO guideDto = new GuideResponseDTO();
                guideDto.setExpertiseCityRegion(guide.getExpertiseCityRegion());
                guideDto.setLanguage(guide.getLanguage());
                guideDto.setAbout(guide.getAbout());
                guideDto.setVehicleAvailability(guide.isVehicleAvailability());
                baseDto = guideDto;
            }
            case ADMIN -> {
                // Admin-specific mapping
                Admin admin = (Admin) user;
                AdminResponseDTO adminDto = new AdminResponseDTO();
                baseDto = adminDto;

            }
            default -> baseDto = new UserResponseDTO();
        }

        // Common fields for all users
        baseDto.setId(user.getId());
        baseDto.setFirstName(user.getFirstName());
        baseDto.setLastName(user.getLastName());
        baseDto.setEmail(user.getEmail());
        baseDto.setContactNumber(user.getContactNumber());
        baseDto.setAddress(user.getAddress());
        baseDto.setRole(user.getRole().name());
        baseDto.setIsVerified(user.isVerified());

        return baseDto;
    }

    /**
     * Get all users
     */
    public List<UserResponseDTO> getAllUserDTOs() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public Optional<UserResponseDTO> getUserById(Long id) {
        return userRepository.findById(id).stream()
                .map(this::mapToUserDTO)
                .findFirst()
                .map(Optional::ofNullable)
                .orElse(Optional.empty());

    }

    /**
     * Get user by email
     */
    public UserResponseDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email).stream()
                .map(this::mapToUserDTO)
                .findFirst()
                .orElse(null);
    }

    /**
     * Get users by role
     */
    public List<UserResponseDTO> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update user information
     */
    public User updateUser(Long id, UserUpdateRequest updateRequest) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = optionalUser.get();

        // Update common fields
        if (updateRequest.getFirstName() != null)
            user.setFirstName(updateRequest.getFirstName());
        if (updateRequest.getLastName() != null)
            user.setLastName(updateRequest.getLastName());
        if (updateRequest.getContactNumber() != null)
            user.setContactNumber(updateRequest.getContactNumber());
        if (updateRequest.getAddress() != null)
            user.setAddress(updateRequest.getAddress());

        // Role-specific updates
        if (user instanceof Traveler traveler && updateRequest.getNationality() != null) {
            traveler.setNationality(updateRequest.getNationality());
        }
        if (user instanceof Guide guide) {
            if (updateRequest.getExpertiseCityRegion() != null)
                guide.setExpertiseCityRegion(updateRequest.getExpertiseCityRegion());
            if (updateRequest.getLanguage() != null)
                guide.setLanguage(updateRequest.getLanguage());
            if (updateRequest.getAbout() != null)
                guide.setAbout(updateRequest.getAbout());
            if (updateRequest.getVehicleAvailability() != null)
                guide.setVehicleAvailability(updateRequest.getVehicleAvailability());
        }

        return userRepository.save(user);
    }

    /**
    * Update user email
    */
    public User requestEmailUpdate(Long id, String newEmail) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if the email is already taken by a different user
        Optional<User> existingUser = userRepository.findByEmail(newEmail);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
            throw new RuntimeException("Email already in use");
        }

        // Store original email temporarily
        String originalEmail = user.getEmail();

         // Generate a verification token
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(24)); // Token valid for 24 hours
        user.setPendingEmail(newEmail); // Store the new email temporarily
        user.setEmail(originalEmail);
        user.setVerified(true);

        return userRepository.save(user);

    }

    /** 
     * Update user password
     */
    public void updatePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("User not found"));

        // checks whether user provided the correct current password
        if(!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword)); // encode password before saving
        userRepository.save(user);



    }
    

    /**
     * Delete user (hard delete)
     */
    public void deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        userRepository.delete(user.get());
    }

    /**
     * Check if a user exists by email
     */
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email) != null;
    }
}