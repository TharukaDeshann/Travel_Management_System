package com.yamu.backend.dto;

public record BookDriverRequest(
        Long driverId,
        String date,
        Long travelerId,
        LocationDTO startLocation,
        LocationDTO endLocation,
        Double travelCost,
        Double travelLength,
        Long dayPlanId
) {}