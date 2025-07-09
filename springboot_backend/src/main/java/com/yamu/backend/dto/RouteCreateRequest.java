package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteCreateRequest {
    private String name;
    private String travelMode;
    private Double totalDistance; // Keep for future, backend ignores for now
    private Integer estimatedTime; // Keep for future, backend ignores for now
}