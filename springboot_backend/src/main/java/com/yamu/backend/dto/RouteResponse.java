package com.yamu.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter 
public class RouteResponse {
    private long id;
    private String name;
    private String travelMode;
    private Double totalDistance;
    private Integer estimatedTime;
    private List<LocationResponse> locations;
}