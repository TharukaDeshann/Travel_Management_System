package com.yamu.backend.service;

import com.yamu.backend.dto.GuideResponseDTO;
import com.yamu.backend.dto.TravelerResponseDTO;
import com.yamu.backend.dto.UserResponseDTO;
import com.yamu.backend.dto.UserUpdateRequest;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.Guide;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Convert entity to correct dto based on role
    public UserResponseDTO mapToUserDTO( User user ){
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