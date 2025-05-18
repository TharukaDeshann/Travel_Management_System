package com.yamu.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuideResponseDTO extends UserResponseDTO {
    private String expertiseCityRegion;
    private String language;
    private String about;
    private List<VehicleResponseDTO> vehicles;

    
}
