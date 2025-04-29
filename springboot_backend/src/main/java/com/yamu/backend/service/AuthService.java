package com.yamu.backend.service;

import com.yamu.backend.dto.UserRegistrationRequest;
import com.yamu.backend.model.Guide;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Register a new user based on the registration request
     */
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

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(24)); // 24-hour expiry
        user.setVerified(false);
        return userRepository.save(user);
    }

    /**
     * Authenticate a user by email and password
     */
    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    /**
     * Resend verification email to a user
     */
    public ResponseEntity<?> resendVerificationEmail(String oldToken) {
        Optional<User> userOpt = userRepository.findByVerificationToken(oldToken);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid token."));
        }

        User user = userOpt.get();
        if (user.isVerified()) {
            return ResponseEntity.ok(Map.of("message", "User already verified."));
        }

        // Generate new token and update
        String newToken = UUID.randomUUID().toString();
        user.setVerificationToken(newToken);
        user.setTokenExpiry(LocalDateTime.now().plusHours(24)); // 24-hour expiry
        userRepository.save(user);

        String link = "http://localhost:5173/verify-email?token=" + newToken;
        emailService.sendEmail(
                user.getEmail(),
                "Resend: Verify your email",
                "Click this link to verify your email: " + link);

        return ResponseEntity.ok(Map.of("message", "Verification email resent."));
    }
    
    /**
     * Verify a user's email with the provided token
     */
    public ResponseEntity<?> verifyEmail(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification token."));
        }
        
        User user = userOpt.get();
        
        if (user.isVerified()) {
            return ResponseEntity.ok(Map.of("message", "Email already verified."));
        }
        
        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token has expired."));
        }
        
        user.setVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }
}