package com.yamu.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationRequest {
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer positionIndex;
    private String placeId;
    private String notes;
}
