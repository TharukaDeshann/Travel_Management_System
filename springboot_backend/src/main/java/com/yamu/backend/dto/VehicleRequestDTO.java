package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehicleRequestDTO {
    private String type;
    private String model;
    private int capacity;
    private boolean airConditioned;
    private boolean available;
    private String vehicleImageUrl;
}
