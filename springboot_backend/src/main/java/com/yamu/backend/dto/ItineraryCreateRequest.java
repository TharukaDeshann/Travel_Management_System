package com.yamu.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter 
public class ItineraryCreateRequest {
    @NotNull(message = "Budget is required")
    private Double budget;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
    private String currency;
    
    @NotNull(message = "Start date is required")
    private Date startDate;
    
    @NotNull(message = "End date is required")
    private Date endDate;
    
    @NotBlank(message = "Trip title is required")
    private String tripTitle;
    
    @NotNull(message = "Traveler ID is required")
    private Long travelerId;
    
    @Valid
    @Size(min = 1, message = "At least one day plan is required")
    private List<DayPlanCreateRequest> dayPlans;
}