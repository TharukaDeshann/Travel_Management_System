package com.yamu.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class GuideReservationResponse {
    private Long id;
    private Long travelerId;
    private UserDto traveler;
    private Long guideId;
    private String guideName;  
    private String guideContact;  
    private Integer numberOfDays;
    private String status;
    private String createdAt;
    private String updatedAt;
    private List<DayDetailDto> dayDetails;

    @Data
    public static class DayDetailDto {
        private int dayNumber;
        private String places;
        private String date;
        private int numberOfTravelers;
        private boolean vehicleRequested;
        private String vehicleDetails;
    }
}