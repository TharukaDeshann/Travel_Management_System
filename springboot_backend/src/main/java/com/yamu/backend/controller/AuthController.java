package com.yamu.backend.controller;

import com.yamu.backend.dto.RefreshTokenRequest;
import com.yamu.backend.dto.UserLoginRequest;
import com.yamu.backend.dto.UserRegistrationRequest;
import com.yamu.backend.model.User;
import com.yamu.backend.service.TokenBlacklistService;
import com.yamu.backend.service.UserService;
import com.yamu.backend.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    @Autowired
    public AuthController(UserService userService, JwtUtil jwtUtil, TokenBlacklistService tokenBlacklistService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody UserRegistrationRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            User registeredUser = userService.registerUser(request);
            response.put("message", "User registered successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody UserLoginRequest loginRequest) {
        Map<String, String> response = new HashMap<>();
        User authenticatedUser = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        if (authenticatedUser != null) {
            String accessToken = jwtUtil.generateAccessToken(authenticatedUser.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(authenticatedUser.getEmail());

            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);

            return ResponseEntity.ok(response);
        }

        response.put("error", "Invalid credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @PostMapping("/refresh-token")
public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
    String refreshToken = request.get("refreshToken");

    try {
        String email = jwtUtil.extractEmail(refreshToken);

        
        if (tokenBlacklistService.isBlacklisted(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Refresh token has been revoked"));
        }

        
        if (email != null && jwtUtil.validateToken(refreshToken, email)) {
            // Generate new access token
            String newAccessToken = jwtUtil.generateAccessToken(email);
            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        }
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
    }

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
}


@PostMapping("/logout")
public ResponseEntity<?> logout(@RequestHeader("Authorization") String tokenHeader, @RequestBody RefreshTokenRequest request) {
    if (tokenHeader != null && tokenHeader.startsWith("Bearer ")) {
        String accessToken = tokenHeader.substring(7);
        String refreshToken = request.getRefreshToken();
        
        System.out.println("Access token: " + accessToken);
        System.out.println("Refresh token: " + refreshToken);

        // Get expiration times from the tokens
        long accessTokenExpiry = jwtUtil.getExpirationDateFromToken(accessToken).getTime();
        long refreshTokenExpiry = jwtUtil.getExpirationDateFromToken(refreshToken).getTime();

        tokenBlacklistService.addToBlacklist(accessToken, accessTokenExpiry);
        tokenBlacklistService.addToBlacklist(refreshToken, refreshTokenExpiry);
        
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
    
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid token format"));
}
}
