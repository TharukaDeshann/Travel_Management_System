package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class RouteCreateRequest {
    private String name;
    private String travelMode;
    private Double totalDistance;
    private Integer estimatedTime;
    private List<LocationCreateRequest> locations;
     
}
