package com.yamu.backend.dto;



import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehicleResponseDTO {
    private Long id;
    private Long guideId;
    private String type;
    private String model;
    private int capacity;
    private boolean airConditioned;
    private boolean available;
    private String vehicleImageUrl;
}
