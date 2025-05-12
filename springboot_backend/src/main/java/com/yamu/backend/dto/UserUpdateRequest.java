package com.yamu.backend.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    

    
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String firstName;

    private String lastName;

    

    
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Contact number must be 10 to 15 digits")
    private String contactNumber;

    
    private String address;

    
    
    private String nationality;

    
    private String expertiseCityRegion;
    
    private String language;
    private String about;
    
    private Boolean vehicleAvailability;
}
