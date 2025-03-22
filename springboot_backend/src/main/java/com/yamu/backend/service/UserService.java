package com.yamu.backend.service;

import com.yamu.backend.dto.UserRegistrationRequest;
import com.yamu.backend.dto.UserUpdateRequest;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.Guide;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;


import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(UserRegistrationRequest request) {
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Account already exists with this email");
        }
    
        User user;
        switch (request.getRole()) {
            case TRAVELER:
                Traveler traveler = new Traveler();
                if (request.getNationality() != null) {
                    traveler.setNationality(request.getNationality());
                } else {
                    throw new RuntimeException("Nationality is required for travelers");
                }
                user = traveler;
                break;
                
            case GUIDE:
                Guide guide = new Guide();
                if (request.getExpertiseCityRegion() != null) {
                    guide.setExpertiseCityRegion(request.getExpertiseCityRegion());
                } else {
                    throw new RuntimeException("Expertise city/region is required for guides");
                }
                
                if (request.getLanguage() != null) {
                    guide.setLanguage(request.getLanguage());
                } else {
                    throw new RuntimeException("Language is required for guides");
                }
                
                guide.setAbout(request.getAbout());
                
                if (request.getVehicleAvailability() != null) {
                    guide.setVehicleAvailability(request.getVehicleAvailability());
                } else {
                    throw new RuntimeException("Vehicle availability is required for guides");
                }
                user = guide;
                break;
                
            
                
            default:
                throw new IllegalArgumentException("Invalid user role");
        }
    
        // Set common attributes
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setContactNumber(request.getContactNumber());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole());
    
        return userRepository.save(user);
    }
    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }


    // Get users by role
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    // Delete user (soft delete - recommended)
    public void deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        userRepository.delete(user.get());
    }

    public User updateUser(Long id, UserUpdateRequest updateRequest) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = optionalUser.get();

        // Update common fields
        if (updateRequest.getFirstName() != null) user.setFirstName(updateRequest.getFirstName());
        if (updateRequest.getLastName() != null) user.setLastName(updateRequest.getLastName());
        if (updateRequest.getContactNumber() != null) user.setContactNumber(updateRequest.getContactNumber());
        if (updateRequest.getAddress() != null) user.setAddress(updateRequest.getAddress());

        // Role-specific updates
        if (user instanceof Traveler traveler && updateRequest.getNationality() != null) {
            traveler.setNationality(updateRequest.getNationality());
        }
        if (user instanceof Guide guide) {
            if (updateRequest.getExpertiseCityRegion() != null) guide.setExpertiseCityRegion(updateRequest.getExpertiseCityRegion());
            if (updateRequest.getLanguage() != null) guide.setLanguage(updateRequest.getLanguage());
            if (updateRequest.getAbout() != null) guide.setAbout(updateRequest.getAbout());
            if (updateRequest.getVehicleAvailability() != null) guide.setVehicleAvailability(updateRequest.getVehicleAvailability());
        }

        userRepository.save(user);
        return user;
    }

}
