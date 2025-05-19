package com.yamu.backend.dto;

import java.sql.Date;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DayPlanResponse {
    private Long id;
    private Date date;
    private String hotelDetails;
    private String transportDetails;
    private String guideDetails;
    private List<LocationResponse> locations;
    private RouteResponse route;
}
