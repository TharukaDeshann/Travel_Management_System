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
    private List<LocationCreateRequest> locations;
    private RouteCreateRequest route;
}