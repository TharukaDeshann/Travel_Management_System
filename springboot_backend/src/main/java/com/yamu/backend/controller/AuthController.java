package com.yamu.backend.controller;

import com.yamu.backend.dto.UserLoginRequest;
import com.yamu.backend.dto.UserRegistrationRequest;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.TokenBlacklistService;
import com.yamu.backend.service.UserService;
import com.yamu.backend.util.JwtUtil;
import com.yamu.backend.validation.GuideRegistration;
import com.yamu.backend.validation.TravelerRegistration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;

    @Autowired
    private Validator validator;

    @Autowired
    public AuthController(UserService userService, JwtUtil jwtUtil, TokenBlacklistService tokenBlacklistService,
            UserRepository userRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistService = tokenBlacklistService;
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
            User registeredUser = userService.registerUser(request);
            String link = "http://your-frontend-url/verify-email?token=" + registeredUser.verificationToken;
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
public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
    Optional<User> userOpt = userRepository.findByVerificationToken(token);

    if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("Invalid token");

    User user = userOpt.get();
    if (user.isVerified()) return ResponseEntity.badRequest().body("Email already verified");

    if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
        return ResponseEntity.status(HttpStatus.GONE).body("Token expired");
    }

    user.setVerified(true);
    user.setVerificationToken(null);
    user.setTokenExpiry(null);
    userRepository.save(user);

    return ResponseEntity.ok("Email verified successfully");
}
@PostMapping("/resend-verification")
public ResponseEntity<String> resendVerification(@RequestBody String email) {
    Optional<User> userOpt = userRepository.findByEmail(email);
    if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found");

    User user = userOpt.get();
    if (user.isVerified()) return ResponseEntity.badRequest().body("Email already verified");

    String newToken = UUID.randomUUID().toString();
    user.setVerificationToken(newToken);
    user.setTokenExpiry(LocalDateTime.now().plusHours(24));
    userRepository.save(user);

    String link = "http://your-frontend-url/verify-email?token=" + newToken;
    emailService.sendEmail(email, "Resend: Verify your email", "Click this link to verify: " + link);

    return ResponseEntity.ok("Verification email resent");
}



    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody UserLoginRequest loginRequest) {
        
        User authenticatedUser = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        if (!authenticatedUser.isVerified()) {
            throw new UnauthorizedException("Please verify your email to login");
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
        User user = userRepository.findByEmail(email);

        if (token == null || !jwtUtil.validateToken(token, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired session"));
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        // Return user details (excluding password)
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("email", user.getEmail());
        userInfo.put("firstName", user.getFirstName());
        userInfo.put("lastName", user.getLastName());
        userInfo.put("role", user.getRole());

        return ResponseEntity.ok(userInfo);
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
