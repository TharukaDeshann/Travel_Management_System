package com.yamu.backend.dto;

import com.yamu.backend.enums.UserRole;
import jakarta.validation.constraints.*;

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

    @NotNull(message = "Role is required")
    private UserRole role;

    // Specialized fields for Traveler
    private String nationality;

    // Specialized fields for Guide
    private String expertiseCityRegion;
    private String language;
    private String about;
    private Boolean vehicleAvailability;

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getExpertiseCityRegion() { return expertiseCityRegion; }
    public void setExpertiseCityRegion(String expertiseCityRegion) { this.expertiseCityRegion = expertiseCityRegion; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public Boolean getVehicleAvailability() { return vehicleAvailability; }
    public void setVehicleAvailability(Boolean vehicleAvailability) { this.vehicleAvailability = vehicleAvailability; }
}
