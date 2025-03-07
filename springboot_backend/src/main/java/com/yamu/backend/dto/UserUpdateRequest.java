package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String contactNumber;
    private String address;
    private String nationality; // Traveler-only field
    private String expertiseCityRegion; // Guide-only field
    private String language; // Guide-only field
    private String about; // Guide-only field
    private Boolean vehicleAvailability; // Guide-only field
}
