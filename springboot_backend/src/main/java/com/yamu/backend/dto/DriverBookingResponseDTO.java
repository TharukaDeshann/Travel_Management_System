package com.yamu.backend.dto;

import com.yamu.backend.model.DriverBooking;

import java.time.LocalDate;
import java.util.Base64;

public record DriverBookingResponseDTO(
        Long id,
        LocalDate bookingDate,
        Long travelerId,
        String status,
        String startLocationName,
        Double startLocationLat,
        Double startLocationLon,
        String endLocationName,
        Double endLocationLat,
        Double endLocationLon,
        Long driverId,
        DriverInfo driver
) {
    public static DriverBookingResponseDTO fromDriverBooking(DriverBooking booking) {
        DriverInfo driverInfo = null;
        if (booking.getDriver() != null) {
            String photoBase64 = booking.getDriver().getPhoto() != null ? 
                Base64.getEncoder().encodeToString(booking.getDriver().getPhoto()) : null;
            
            driverInfo = new DriverInfo(
                booking.getDriver().getId(),
                booking.getDriver().getName(),
                booking.getDriver().getRating(),
                photoBase64,
                booking.getDriver().getVehicle() != null ? booking.getDriver().getVehicle().getType() : null,
                booking.getDriver().getVehicle() != null ? booking.getDriver().getVehicle().getVehicleNumber() : null,
                booking.getDriver().getVehicle() != null ? booking.getDriver().getVehicle().getBrand() : null,
                booking.getDriver().getVehicle() != null ? booking.getDriver().getVehicle().getModel() : null,
                booking.getDriver().getVehicle() != null ? booking.getDriver().getVehicle().getColor() : null
            );
        }
        
        return new DriverBookingResponseDTO(
            booking.getId(),
            booking.getBookingDate(),
            booking.getTravelerId(),
            booking.getStatus(),
            booking.getStartLocationName(),
            booking.getStartLocationLat(),
            booking.getStartLocationLon(),
            booking.getEndLocationName(),
            booking.getEndLocationLat(),
            booking.getEndLocationLon(),
            booking.getDriver() != null ? booking.getDriver().getId() : null,
            driverInfo
        );
    }
    
    public record DriverInfo(
        Long id,
        String name,
        double rating,
        String photoBase64,
        String vehicleType,
        String vehicleNumber,
        String vehicleBrand,
        String vehicleModel,
        String vehicleColor
    ) {}
}
