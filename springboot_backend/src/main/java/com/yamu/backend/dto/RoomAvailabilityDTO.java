package com.yamu.backend.dto;

import com.yamu.backend.model.HotelBooking;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailabilityDTO {
    
    private List<RoomTypeInfo> availableRooms;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomTypeInfo {
        private HotelBooking.RoomType roomType;
        private String description;
        private BigDecimal pricePerNight;
        private Integer availableRooms;
        private Integer maxOccupancy;
        private List<String> amenities;
        private List<String> images;
        private String bedConfiguration;
        private Integer roomSize; // in square meters
        private boolean isAvailable;
    }
}
