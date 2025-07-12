package com.yamu.backend.controller;

import com.yamu.backend.dto.DayPlanCreateRequest;
import com.yamu.backend.dto.DayPlanDetailResponse;
import com.yamu.backend.service.DayPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/day-plans")
public class DayPlanController {

    @Autowired
    private DayPlanService dayPlanService;

    @PostMapping("/itinerary/{itineraryId}")
    public ResponseEntity<DayPlanDetailResponse> createDayPlan(
            @PathVariable Long itineraryId,
            @RequestBody DayPlanCreateRequest request) {
         DayPlanDetailResponse response = dayPlanService.createDayPlan(itineraryId, request);
        return ResponseEntity.ok(response);
    }
}