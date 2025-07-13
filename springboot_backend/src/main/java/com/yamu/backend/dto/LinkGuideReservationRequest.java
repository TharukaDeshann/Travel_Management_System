package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LinkGuideReservationRequest {
    private Long dayPlanId;
    private Long guideReservationId;
    private Long guideReservationDayDetailId;
} 