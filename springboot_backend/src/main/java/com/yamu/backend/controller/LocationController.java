package com.yamu.backend.controller;

import com.yamu.backend.dto.LocationCreateRequest;
import com.yamu.backend.dto.LocationUpdateRequest;
import com.yamu.backend.model.Location;
import com.yamu.backend.repository.LocationRepository;
import com.yamu.backend.service.LocationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    @Autowired
    private final LocationRepository locationRepository;
    private final LocationService  locationService;

    public LocationController(LocationRepository locationRepository, LocationService locationService) {
        this.locationRepository = locationRepository;
        this.locationService = locationService;
    }

    @GetMapping("/day-plan/{dayPlanId}")
    public List<Location> getLocationsByDayPlan(@PathVariable String dayPlanId) {
        return locationRepository.findByDayPlanId(dayPlanId);
    }

    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable long id) {
        Location location = locationService.getLocationById(id);
        return ResponseEntity.ok(location);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLocation(@PathVariable long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok("Location deleted successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateLocation(@PathVariable long id, @RequestBody LocationUpdateRequest locationUpdateRequest) {
        locationService.updateLocation(id, locationUpdateRequest);
        return ResponseEntity.ok("Location updated successfully");
    }

    @PostMapping("/create")
    public ResponseEntity<String> createLocation(@RequestBody LocationCreateRequest location) {
        locationService.addLocation(location);
        return ResponseEntity.ok("Location created successfully");
    }
}