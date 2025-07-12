package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class DayPlanCreateRequest {
    private Date date;
    private String hotelDetails;
    private String transportDetails;
    private String guideDetails;
    private List<LocationCreateRequest> locations;
    private RouteCreateRequest route;

    // Add new field
    private Long guideReservationId;

    // Add getter and setter
    public Long getGuideReservationId() {
        return guideReservationId;
    }

    public void setGuideReservationId(Long guideReservationId) {
                this.guideReservationId = guideReservationId;
            }
        }