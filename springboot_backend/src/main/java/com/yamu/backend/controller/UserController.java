package com.yamu.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.azure.core.annotation.Patch;
import com.yamu.backend.dto.EmailUpdateRequest;
import com.yamu.backend.dto.PasswordUpdateRequest;
import com.yamu.backend.dto.UserResponseDTO;
import com.yamu.backend.dto.UserUpdateRequest;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.User;
import com.yamu.backend.model.WeatherResponse.Sys;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.EmailService;
import com.yamu.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    private final UserService userService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public UserController(UserService userService, EmailService emailService, UserRepository userRepository) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.userService = userService;
    }

    @GetMapping("/user")
    public String userPage() {
        return "You are an authenticated user";
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUserDTOs());
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        Optional<UserResponseDTO> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // UPDATE USER
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest updateRequest) {
        // Add authorization check to ensure users can only update their own profiles
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserResponseDTO currentUser = userService.getUserByEmail(authentication.getName());

        if (currentUser != null && (currentUser.getId().equals(id))) {
            User user = userService.updateUser(id, updateRequest);
            return ResponseEntity.ok("User updated successfully");

        } else {
            return ResponseEntity.status(403).body("You are not authorized to update this user");
        }

    }

    // Update user email
    @PutMapping("/{id}/email")
    public ResponseEntity<Map<String, String>> updateEmail(@PathVariable Long id,
            @RequestBody @Valid EmailUpdateRequest request) {
        System.out.println("Updating email for user with ID: " + id);

        Map<String, String> response = new HashMap<>();

        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName(); // This is typically the email

            // Get the user from the database to check permissions
            Optional<User> optionalCurrentUser = userRepository.findByEmail(currentUsername);

            if (optionalCurrentUser.isEmpty()) {
                response.put("error", "Authentication error");
                return ResponseEntity.status(401).body(response);
            }

            User currentUser = optionalCurrentUser.get();

            // Check if the user is updating their own email or is an admin
            if (!currentUser.getId().equals(id) && !currentUser.getRole().equals(UserRole.ADMIN)) {
                response.put("error", "You don't have permission to update this user's email");
                return ResponseEntity.status(403).body(response);
            }

            // Process the email update
            User updatedUser = userService.requestEmailUpdate(id, request.getNewEmail());

            // Send verification email
            String link = "http://localhost:5173/verify-email?token=" + updatedUser.getVerificationToken();
            emailService.sendEmail(
                    updatedUser.getPendingEmail(),
                    "Verify your email",
                    "Click this link to verify your email: " + link);

            response.put("message", "Verification email sent to " + request.getNewEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Update user password
    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(@PathVariable Long id,
            @RequestBody @Valid PasswordUpdateRequest passwordUpdateRequest) {
        // Add authorization check to ensure users can only update their own profiles
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserResponseDTO currentUser = userService.getUserByEmail(authentication.getName());

        if (currentUser != null && (currentUser.getId().equals(id))) {
            userService.updatePassword(id, passwordUpdateRequest.getCurrentPassword(),
                    passwordUpdateRequest.getNewPassword());
            return ResponseEntity.ok("Password updated successfully");

        } else {
            return ResponseEntity.status(403).body("You are not authorized to update this user's password");
        }

    }


    // Get users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRole(@PathVariable UserRole role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Delete user (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

}
