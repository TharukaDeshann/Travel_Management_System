package com.yamu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponseDTO {
    
    private Long id;
    private String packageName;
    private String description;
    private Integer durationDays;
    private BigDecimal budgetPerPerson;
    private String currency;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Hotel details
    private HotelResponseDTO selectedHotel;
    
    // Vehicle details
    private VehicleResponseDTO selectedVehicle;
    
    // Driver details
    private DriverDetailsDTO selectedDriver;
    
    // Guide details
    private GuideDetailsDTO selectedGuide;
    
    // Day plans
    private List<PackageDayPlanResponseDTO> dayPlans;
    
    // Budget breakdown
    private PackageBudgetBreakdownDTO budgetBreakdown;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageDayPlanResponseDTO {
        private Long id;
        private Integer dayNumber;
        private String dayTitle;
        private String description;
        private String plannedLocations;
        private String activities;
        private BigDecimal estimatedCostPerPerson;
        private String transportationDetails;
        private String mealPlans;
        private String notes;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageBudgetBreakdownDTO {
        private BigDecimal hotelCostPerPerson;
        private BigDecimal transportationCostPerPerson;
        private BigDecimal activitiesCostPerPerson;
        private BigDecimal mealsCostPerPerson;
        private BigDecimal miscellaneousCostPerPerson;
        private BigDecimal totalCostPerPerson;
        
        // For group calculation
        public BigDecimal calculateTotalForGroup(Integer groupSize) {
            return totalCostPerPerson.multiply(BigDecimal.valueOf(groupSize));
        }
    }
}
