package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationDetailResponse {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer positionIndex;
    private String placeId;
    private String notes;
}
