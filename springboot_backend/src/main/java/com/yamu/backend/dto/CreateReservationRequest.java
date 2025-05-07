package com.yamu.backend.dto;

import java.util.List;

public class CreateReservationRequest {
    private Long travelerId;
    private Long guideId;
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

    public static class DayDetail {
        private int dayNumber;
        private String place;
        private String date;
        private int numberOfTravelers;

        // Getters and Setters
        public int getDayNumber() {
            return dayNumber;
        }

        public void setDayNumber(int dayNumber) {
            this.dayNumber = dayNumber;
        }

        public String getPlace() {
            return place;
        }

        public void setPlace(String place) {
            this.place = place;
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
    }
}