package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

import jakarta.validation.constraints.NotNull;


@Getter 
@Setter
public class ItineraryRequest {
    private double budget;
    private String currency;
    private Date startDate;
    private Date endDate;
    private String tripTitle;
    private Long travelerId; // For assigning ownership
}
