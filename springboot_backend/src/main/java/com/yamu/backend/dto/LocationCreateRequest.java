package com.yamu.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
public class LocationCreateRequest {
    @NotBlank(message = "Location name is required")
    private String name;
    
    private String address;
    
    @NotNull(message = "Latitude is required")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    private Double longitude;
    
    @NotNull(message = "Position index is required")
    private Integer positionIndex;
    
    private String placeId;
    private String notes;
}
