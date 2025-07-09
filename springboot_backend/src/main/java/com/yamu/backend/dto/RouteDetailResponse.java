package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteDetailResponse {
    private Long id;
    private String name;
    private String travelMode;
    private Double totalDistance;
    private Integer estimatedTime;
}