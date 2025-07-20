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

    @GetMapping("/itinerary/{itineraryId}/date/{date}")
    public ResponseEntity<DayPlanDetailResponse> getDayPlanByItineraryIdAndDate(
            @PathVariable Long itineraryId,
            @PathVariable String date) {
        try {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            java.util.Date parsedDate = sdf.parse(date);
            var dayPlan = dayPlanService.getDayPlanByItineraryIdAndDate(itineraryId, parsedDate);
            if (dayPlan == null) return ResponseEntity.notFound().build();
            // Reuse buildDayPlanResponse for DTO
            DayPlanDetailResponse response = new DayPlanDetailResponse();
            response.setId(dayPlan.getId());
            response.setDate(dayPlan.getDate());
            response.setHotelDetails(dayPlan.getHotelDetails());
            response.setTransportDetails(dayPlan.getTransportDetails());
            // Optionally add locations/route if needed
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}