package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class ItineraryCreateRequest {
    private Double budget;
    private String currency;
    private Date startDate;
    private Date endDate;
    private String tripTitle;
    private Long travelerId;
    private List<DayPlanCreateRequest> dayPlans; // Added DayPlan list
}