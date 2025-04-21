package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationResponse {
    private long id;
    private String name;
    private double longitude;
    private double latitude;
    private int positionIndex;
    private String placeId;
    private String address;
    private String notes;
}