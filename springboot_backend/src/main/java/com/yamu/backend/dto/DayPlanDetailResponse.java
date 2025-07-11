package com.yamu.backend.dto;


import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class DayPlanDetailResponse {
    private Long id;
    private Date date;
    private String hotelDetails;
    private String transportDetails;
    private String guideDetails;
    private List<LocationDetailResponse> locations;
    private RouteDetailResponse route;
}