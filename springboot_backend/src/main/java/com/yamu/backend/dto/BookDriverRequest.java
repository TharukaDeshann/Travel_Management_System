package com.yamu.backend.dto;

public record BookDriverRequest(
        Long driverId,
        String date,
        Long travelerId,
        LocationDTO startLocation,
        LocationDTO endLocation,
        Double travelCost,      // <-- Add this
        Double travelLength     // <-- Optionally, add this
) {}