package com.yamu.backend.controller;

import com.yamu.backend.model.Location;
import com.yamu.backend.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    @Autowired
    private LocationRepository locationRepository;

    @GetMapping("/day-plan/{dayPlanId}")
    public List<Location> getLocationsByDayPlan(@PathVariable String dayPlanId) {
        return locationRepository.findByDayPlanId(dayPlanId);
    }
}