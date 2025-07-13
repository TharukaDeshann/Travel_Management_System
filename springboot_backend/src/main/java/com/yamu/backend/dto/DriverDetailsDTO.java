package com.yamu.backend.dto;

import com.yamu.backend.model.Driver;

import java.util.Base64;

public record DriverDetailsDTO(Long id, String name, String description, double rating, String photoBase64,
                               String vehicleNumber, String vehicleType, String brand, String model, String color) {
    public static DriverDetailsDTO fromDriver(Driver d) {
        String imageStr = d.getPhoto() != null ? Base64.getEncoder().encodeToString(d.getPhoto()) : null;
        return new DriverDetailsDTO(
                d.getId(),
                d.getName(),
                d.getDescription(),
                d.getRating(),
                imageStr,
                d.getVehicle().getVehicleNumber(),
                d.getVehicle().getType(),
                d.getVehicle().getBrand(),
                d.getVehicle().getModel(),
                d.getVehicle().getColor()
        );
    }
}