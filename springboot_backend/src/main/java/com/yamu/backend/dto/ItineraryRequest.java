package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class ItineraryRequest {
    private String userId;
    private String tripTitle;
    private Date startDate;
    private Date endDate;
    private double budget;
    private String currency;
    private List<DayPlanRequest> dayPlans;

    @Getter
    @Setter
    public static class DayPlanRequest {
        private Date date;
        private String hotelDetails;      // Optional
        private String transportDetails;  // Optional
        private String guideDetails;      // Optional
        private List<LocationRequest> locations;

        @Getter
        @Setter
        public static class LocationRequest {
            private String name;
            private String address;
            private double latitude;
            private double longitude;
            private int positionIndex;
            private String placeId;
            private String notes;
        }
    }
}
