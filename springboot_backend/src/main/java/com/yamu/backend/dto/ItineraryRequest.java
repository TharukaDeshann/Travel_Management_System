package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Getter
@Setter
public class ItineraryRequest {
    private String userId;
    private String tripTitle;
    private Date startDate;
    private Date endDate;
    private double budget;
    private String currency;
    
}
