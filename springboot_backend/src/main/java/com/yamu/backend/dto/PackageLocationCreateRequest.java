package com.yamu.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageLocationCreateRequest {
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer positionIndex;
    private String placeId; // Google Places API ID
    private String notes;
}
