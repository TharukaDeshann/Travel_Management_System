package com.yamu.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageRouteCreateRequest {
    private String name;
    private String travelMode; // driving-car, cycling-regular, foot-walking
    private Double totalDistance; // in kilometers
    private Integer estimatedTime; // in minutes
    private List<PackageLocationCreateRequest> locations;
}
