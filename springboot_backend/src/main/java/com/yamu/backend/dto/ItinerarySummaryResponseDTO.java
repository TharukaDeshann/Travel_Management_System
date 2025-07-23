package com.yamu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItinerarySummaryResponseDTO {
    private Long id;
    private String tripTitle;
    private Date startDate;
    private Date endDate;
    private Double budget;
    private String currency;
} 