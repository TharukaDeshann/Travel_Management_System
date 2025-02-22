package com.yamu.backend.controller;

import com.yamu.backend.dto.UserRegistrationRequest;
import com.yamu.backend.model.User;
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

    @Autowired  
    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
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
public ResponseEntity<Map<String, String>> login(@RequestParam String email, @RequestParam String password) {
    Map<String, String> response = new HashMap<>();
    User authenticatedUser = userService.authenticate(email, password);

    if (authenticatedUser != null) {
        String token = jwtUtil.generateToken(authenticatedUser.getEmail());
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    response.put("error", "Invalid credentials");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
}
}
