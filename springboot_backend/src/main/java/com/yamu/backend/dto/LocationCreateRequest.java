package com.yamu.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationCreateRequest {
    @NotNull(message = "Day plan ID is required")
    private String dayPlanId;

    @NotNull(message = "Name is required")
    private String name;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private int positionIndex;
    private String placeId;
    private String address;
    private String notes;
}
