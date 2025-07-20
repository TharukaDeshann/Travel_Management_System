package com.yamu.backend.dto;

import com.yamu.backend.model.Driver;

import java.util.Base64;

public record DriverSummaryDTO(Long id, String name, double rating,Double ratePerLng, String photoBase64, String vehicleType) {
    public static DriverSummaryDTO fromDriver(Driver d) {
        String imageStr = d.getPhoto() != null ? Base64.getEncoder().encodeToString(d.getPhoto()) : null;
        return new DriverSummaryDTO(d.getId(), d.getName(), d.getRating(), d.getRatePerLng(), imageStr, d.getVehicle().getType());
    }
}