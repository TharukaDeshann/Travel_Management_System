package com.yamu.backend.dto;

import java.sql.Date;
import java.util.List;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class DayPlanRequest {
    private Long itineraryId;
    private Date date;
    private String hotelDetails;
    private String transportDetails;
    private String guideDetails;

    
    @Valid
    private List<LocationRequest> locations;

    @Valid
    private RouteRequest route;
}