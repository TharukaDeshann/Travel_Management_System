package com.yamu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
public class RouteCreateRequest {
    @NotBlank(message = "Route name is required")
    private String name;
    
    private String travelMode;
    private Double totalDistance;
    private Integer estimatedTime;
}
