package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuideResponseDTO extends UserResponseDTO {
    private String expertiseCityRegion;
    private String language;
    private String about;
    private boolean vehicleAvailability;
}
