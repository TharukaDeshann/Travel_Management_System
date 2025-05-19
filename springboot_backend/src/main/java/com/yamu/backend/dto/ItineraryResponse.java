package com.yamu.backend.dto;

import java.sql.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItineraryResponse {
    private Long id;
    private double budget;
    private String currency;
    private Date startDate;
    private Date endDate;
    private String tripTitle;
}