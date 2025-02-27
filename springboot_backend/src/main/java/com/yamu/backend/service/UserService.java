package com.yamu.backend.service;

import com.yamu.backend.dto.UserRegistrationRequest;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.Admin;
import com.yamu.backend.model.Guide;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                traveler.setNationality(request.getNationality());
                user = traveler;
                break;
            case GUIDE:
                Guide guide = new Guide();
                guide.setExpertiseCityRegion(request.getExpertiseCityRegion());
                guide.setLanguage(request.getLanguage());
                guide.setAbout(request.getAbout());
                guide.setVehicleAvailability(request.getVehicleAvailability());
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

    
}
