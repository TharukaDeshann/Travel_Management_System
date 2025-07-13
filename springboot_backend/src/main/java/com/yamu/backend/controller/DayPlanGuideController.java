package com.yamu.backend.controller;

import com.yamu.backend.dto.LinkGuideReservationRequest;
import com.yamu.backend.model.DayPlanGuide;
import com.yamu.backend.service.DayPlanGuideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/day-plan-guides")
public class DayPlanGuideController {

    @Autowired
    private DayPlanGuideService dayPlanGuideService;

    @PostMapping("/link")
    public ResponseEntity<DayPlanGuide> linkGuideReservationToDayPlan(@RequestBody LinkGuideReservationRequest request) {
        DayPlanGuide dayPlanGuide = dayPlanGuideService.linkGuideReservationToDayPlan(
            request.getDayPlanId(),
            request.getGuideReservationId(),
            request.getGuideReservationDayDetailId()
        );
        return ResponseEntity.ok(dayPlanGuide);
    }

    @GetMapping("/day-plan/{dayPlanId}")
    public ResponseEntity<DayPlanGuide> getByDayPlanId(@PathVariable Long dayPlanId) {
        return dayPlanGuideService.findByDayPlanId(dayPlanId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 