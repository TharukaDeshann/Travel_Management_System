package com.yamu.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageCreateRequestDTO {
    
    @NotBlank(message = "Package name is required")
    @Size(max = 100, message = "Package name cannot exceed 100 characters")
    private String packageName;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Duration in days is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    @Max(value = 30, message = "Duration cannot exceed 30 days")
    private Integer durationDays;
    
    @NotNull(message = "Budget per person is required")
    @DecimalMin(value = "0.01", message = "Budget must be greater than 0")
    private BigDecimal budgetPerPerson;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
    private String currency;
    
    // Hotel selection
    private Long selectedHotelId;
    
    // Vehicle selection
    private Long selectedVehicleId;
    
    // Driver selection (optional, can use vehicle's default driver)
    private Long selectedDriverId;
    
    // Day plans for the package
    @Valid
    @NotEmpty(message = "At least one day plan is required")
    @Size(min = 1, message = "At least one day plan is required")
    private List<PackageDayPlanDTO> dayPlans;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageDayPlanDTO {
        
        @NotNull(message = "Day number is required")
        @Min(value = 1, message = "Day number must be at least 1")
        private Integer dayNumber;
        
        @NotBlank(message = "Day title is required")
        @Size(max = 200, message = "Day title cannot exceed 200 characters")
        private String dayTitle;
        
        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        private String description;
        
        @NotBlank(message = "Planned locations are required")
        private String plannedLocations; // JSON string of locations
        
        @NotBlank(message = "Activities are required")
        private String activities;
        
        @DecimalMin(value = "0.00", message = "Estimated cost cannot be negative")
        private BigDecimal estimatedCostPerPerson;
        
        private String transportationDetails;
        
        private String mealPlans;
        
        private String notes;
    }
}
