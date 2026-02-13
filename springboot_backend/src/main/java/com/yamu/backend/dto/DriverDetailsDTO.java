package com.yamu.backend.dto;

import com.yamu.backend.model.Driver;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Base64;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverDetailsDTO {
    private Long id;
    private String name;
    private String description;
    private double rating;
    private Double ratePerLng;
    private String photoBase64;
    private String vehicleNumber;
    private String vehicleType;
    private String brand;
    private String model;
    private String color;

    public static DriverDetailsDTO fromDriver(Driver d) {
        String imageStr = d.getPhoto() != null ? Base64.getEncoder().encodeToString(d.getPhoto()) : null;
        return new DriverDetailsDTO(
                d.getId(),
                d.getName(),
                d.getDescription(),
                d.getRating(),
                d.getRatePerLng(),
                imageStr,
                d.getVehicle().getVehicleNumber(),
                d.getVehicle().getType(),
                d.getVehicle().getBrand(),
                d.getVehicle().getModel(),
                d.getVehicle().getColor()
        );
    }
}