package com.yamu.backend.dto;

import jakarta.validation.constraints.*;
import java.util.List;

// DTO for creating a reservation request
public class CreateReservationRequest {

    @NotNull(message = "Traveler ID is required")
    private Long travelerId;

    @NotNull(message = "Guide ID is required")
    private Long guideId;

    @NotEmpty(message = "At least one day detail is required")
    private List<DayDetail> dayDetails;

    // Getters and Setters
    public Long getTravelerId() {
        return travelerId;
    }

    public void setTravelerId(Long travelerId) {
        this.travelerId = travelerId;
    }

    public Long getGuideId() {
        return guideId;
    }

    public void setGuideId(Long guideId) {
        this.guideId = guideId;
    }

    public List<DayDetail> getDayDetails() {
        return dayDetails;
    }

    public void setDayDetails(List<DayDetail> dayDetails) {
        this.dayDetails = dayDetails;
    }

    // Inner class representing details for each day of the reservation
    public static class DayDetail {
        @Min(value = 1, message = "Day number must be at least 1")
        private int dayNumber;

        @NotBlank(message = "Place is required")
        private String places;

        @NotNull(message = "Date is required")
        private String date;

        @Min(value = 1, message = "There must be at least 1 traveler")
        private int numberOfTravelers;

        private boolean vehicleRequested;
        private String vehicleDetails;

        // Getters and Setters
        public int getDayNumber() {
            return dayNumber;
        }

        public void setDayNumber(int dayNumber) {
            this.dayNumber = dayNumber;
        }

        public String getPlaces() {
            return places;
        }

        public void setPlaces(String places) {
            this.places = places;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public int getNumberOfTravelers() {
            return numberOfTravelers;
        }

        public void setNumberOfTravelers(int numberOfTravelers) {
            this.numberOfTravelers = numberOfTravelers;
        }

        public boolean isVehicleRequested() {
            return vehicleRequested;
        }

        public void setVehicleRequested(boolean vehicleRequested) {
            this.vehicleRequested = vehicleRequested;
        }

        public String getVehicleDetails() {
            return vehicleDetails;
        }

        public void setVehicleDetails(String vehicleDetails) {
            this.vehicleDetails = vehicleDetails;
        }
    }
}