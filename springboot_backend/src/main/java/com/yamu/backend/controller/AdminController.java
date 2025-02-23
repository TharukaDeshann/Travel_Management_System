package com.yamu.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.UserService;


@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminController {
    private final UserService userService;
    private final UserRepository userRepository;

    public AdminController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/assign-admin/{userId}")
    @PreAuthorize("hasRole('ADMIN')") // Only admins can call this endpoint
    public ResponseEntity<?> assignAdmin(@PathVariable Long userId, Authentication authentication) {
        User adminUser = userRepository.findByEmail(authentication.getName()); // Get logged-in admin

        if (adminUser == null || adminUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only admins can promote users to admin.");
        }

        try {
            User updatedUser = userService.assignAdminRole(userId, adminUser);
            return ResponseEntity.ok("User with ID " + userId + " is now an admin.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

