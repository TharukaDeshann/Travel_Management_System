package com.yamu.backend.controller;

import com.yamu.backend.dto.UserLoginRequest;
import com.yamu.backend.dto.UserRegistrationRequest;
import com.yamu.backend.dto.UserResponseDTO;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.Guide;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.EmailService;
import com.yamu.backend.service.TokenBlacklistService;
import com.yamu.backend.service.UserService;
import com.yamu.backend.service.AuthService;
import com.yamu.backend.util.JwtUtil;
import com.yamu.backend.validation.GuideRegistration;
import com.yamu.backend.validation.TravelerRegistration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;

import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.http.Cookie;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserService userService;

    @Autowired
    private Validator validator;

    @Autowired
    public AuthController(AuthService authService, JwtUtil jwtUtil, TokenBlacklistService tokenBlacklistService,
            UserRepository userRepository, EmailService emailService, UserService userService) {
        this.userService = userService;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistService = tokenBlacklistService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody UserRegistrationRequest request) {
        Map<String, String> response = new HashMap<>();

        // Validate common fields first (default validation)
        Set<ConstraintViolation<UserRegistrationRequest>> violations = validator.validate(request);

        // Perform role-specific validation
        if (violations.isEmpty()) {
            if (request.getRole() == UserRole.TRAVELER) {
                violations = validator.validate(request, TravelerRegistration.class);
            } else if (request.getRole() == UserRole.GUIDE) {
                violations = validator.validate(request, GuideRegistration.class);
            }
            // Add other roles as needed
        }

        // If there are validation errors, return them
        if (!violations.isEmpty()) {
            String errorMsg = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            response.put("error", errorMsg);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            User registeredUser = authService.registerUser(request);
            String link = "http://localhost:5173/verify-email?token=" + registeredUser.getVerificationToken();
            emailService.sendEmail(
                    registeredUser.getEmail(),
                    "Verify your email",
                    "Click this link to verify your email: " + link);
            response.put("message", "Verify your email to acivate the account");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        Map<String, String> response = new HashMap<>();

        try {
            // Find user by verification token
            Optional<User> optionalUser = userRepository.findByVerificationToken(token);

            if (optionalUser.isEmpty()) {
                response.put("error", "Invalid verification token");
                return ResponseEntity.badRequest().body(response);
            }

            User user = optionalUser.get();

            // Check if token has expired
            if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
                response.put("error", "Verification token has expired");
                return ResponseEntity.badRequest().body(response);
            }

            // If this is an email update, update the email
            if (user.getPendingEmail() != null && !user.getPendingEmail().isEmpty()) {
                user.setEmail(user.getPendingEmail());
                user.setPendingEmail(null);
            }

            // Mark user as verified
            user.setVerified(true);
            user.setVerificationToken(null);
            user.setTokenExpiry(null);

            userRepository.save(user);

            response.put("message", "Email successfully verified");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Resend verification email
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        String oldToken = request.get("token");

        return authService.resendVerificationEmail(oldToken);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody UserLoginRequest loginRequest) {

        User authenticatedUser = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        if (!authenticatedUser.isVerified()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please verify your email to login");
        }

        if (authenticatedUser != null) {
            String accessToken = jwtUtil.generateAccessToken(authenticatedUser.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(authenticatedUser.getEmail());

            // Create HTTP-only cookies
            ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                    .httpOnly(true)
                    .secure(true) // Set to true in production (requires HTTPS)
                    .path("/")
                    .maxAge(60) // 1 minutes for access token
                    .sameSite("Strict")
                    .build();

            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(604800) // 7 days for refresh token
                    .sameSite("Strict")
                    .build();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("role", authenticatedUser.getRole());

            return ResponseEntity.ok()
                    .header("Set-Cookie", accessTokenCookie.toString())
                    .header("Set-Cookie", refreshTokenCookie.toString())
                    .body(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Refresh token is missing"));
        }

        try {
            String email = jwtUtil.extractEmail(refreshToken);

            if (tokenBlacklistService.isBlacklisted(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Refresh token has been revoked"));
            }

            if (email != null && jwtUtil.validateToken(refreshToken, email)) {
                // Generate new access token
                String newAccessToken = jwtUtil.generateAccessToken(email);

                // Create HTTP-only cookie
                ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", newAccessToken)
                        .httpOnly(true)
                        .secure(true) // Set to true in production (requires HTTPS)
                        .path("/")
                        .maxAge(60) // 1 minutes for access token
                        .sameSite("Strict")
                        .build();

                return ResponseEntity.ok()
                        .header("Set-Cookie", accessTokenCookie.toString())
                        .body(Map.of("message", "Access token refreshed"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(value = "accessToken", required = false) String accessToken,
            @CookieValue(value = "refreshToken", required = false) String refreshToken) {

        if (accessToken != null) {
            long accessTokenExpiry = jwtUtil.getExpirationDateFromToken(accessToken).getTime();
            tokenBlacklistService.addToBlacklist(accessToken, accessTokenExpiry);
        }

        if (refreshToken != null) {
            long refreshTokenExpiry = jwtUtil.getExpirationDateFromToken(refreshToken).getTime();
            tokenBlacklistService.addToBlacklist(refreshToken, refreshTokenExpiry);
        }

        // Claer cookies by setting expiration time to 0
        ResponseCookie clearAccessToken = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        ResponseCookie clearRefreshToken = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", clearAccessToken.toString())
                .header("Set-Cookie", clearRefreshToken.toString())
                .body(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUser(HttpServletRequest request) {
        // Get token from cookies
        String token = extractTokenFromCookie(request);
        // Extract user email from token
        String email = jwtUtil.extractEmail(token);
        Optional<User> optUser = userRepository.findByEmail(email);
        User user = optUser.orElse(null);

        // Validate token and user
        if (token == null || !jwtUtil.validateToken(token, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired session"));
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        // Return user details (excluding sensitive information)
        UserResponseDTO userResponseDTO = userService.mapToUserDTO(user);


        return ResponseEntity.ok(userResponseDTO);
    }

    

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@CookieValue(value = "accessToken", required = false) String accessToken) {
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access token is missing"));
        }

        try {
            String email = jwtUtil.extractEmail(accessToken);
            Optional<User> optUser = userRepository.findByEmail(email);
            if (optUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }

            User user = optUser.get();

            UserResponseDTO userResponseDTO = userService.mapToUserDTO(user);

            return ResponseEntity.ok(userResponseDTO);
        }  catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired token"));
        }
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

}
