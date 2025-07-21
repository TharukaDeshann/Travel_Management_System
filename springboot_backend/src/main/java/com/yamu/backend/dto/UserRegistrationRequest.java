package com.yamu.backend.dto;

import java.time.LocalDateTime;

import com.yamu.backend.enums.UserRole;
import com.yamu.backend.validation.GuideRegistration;
import com.yamu.backend.validation.TravelerRegistration;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegistrationRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String firstName;
    private String lastName;
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", 
    message = "Password must contain at least one uppercase letter, one number, and one special character")
    private String password;
    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Contact number must be 10 to 15 digits")
    private String contactNumber;
    @NotBlank(message = "Address is required")
    private String address;
    private boolean isVerified = false;
    private String verificationToken;
    private LocalDateTime tokenExpiry;
    @NotNull(message = "Role is required")
    private UserRole role;
    // Specialized fields for Traveler - only validated for TRAVELER role
    @NotNull(groups = TravelerRegistration.class, message = "Nationality is required for travelers")
    private String nationality;
    // Specialized fields for Guide - only validated for GUIDE role
    @NotNull(groups = GuideRegistration.class, message = "Expertise city/region is required for guides")
    private String expertiseCityRegion;
    @NotNull(groups = GuideRegistration.class, message = "Language is required for guides")
    private String language;
    private String about;

    


    

    
    
}