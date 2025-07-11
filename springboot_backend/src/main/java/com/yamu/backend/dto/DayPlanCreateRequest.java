package com.yamu.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class DayPlanCreateRequest {
    @NotNull(message = "Date is required")
    private Date date;
    
    private String hotelDetails;
    private String transportDetails;
    private String guideDetails;
    
    @Valid
    private List<LocationCreateRequest> locations;
    
    @Valid
    private RouteCreateRequest route;
}