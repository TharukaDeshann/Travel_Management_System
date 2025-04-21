package com.yamu.backend.dto;

import com.yamu.backend.enums.UserRole;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String firstName;

    private String lastName;

   

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Contact number must be 10 to 15 digits")
    private String contactNumber;

    @NotBlank(message = "Address is required")
    private String address;

    
    // Specialized fields for Traveler
    @NotNull(message = "Nationality is required")
    private String nationality;

    // Specialized fields for Guide
    @NotNull(message = "Expertise city/region is required")
    private String expertiseCityRegion;
    @NotNull(message = "Language is required")
    private String language;
    private String about;
    @NotNull(message = "Vehicle availability is required")
    private Boolean vehicleAvailability;
}
