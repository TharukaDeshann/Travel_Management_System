package com.yamu.backend.controller;

import com.yamu.backend.dto.LocationCreateRequest;
import com.yamu.backend.dto.LocationUpdateRequest;
import com.yamu.backend.model.Location;
import com.yamu.backend.service.LocationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/locations")
@Validated
public class LocationController {

    private final LocationService locationService;

    @Autowired
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public List<Location> getAllLocations() {
        return locationService.getAllLocations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable long id) {
        Optional<Location> location = locationService.getLocationById(id);
        if (location.isPresent()) {
            return ResponseEntity.ok(location.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<String> addLocation(@Valid @RequestBody List<LocationCreateRequest> createRequests) {
        locationService.addLocation(createRequests);
        return ResponseEntity.ok("Locations added successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable long id, @Valid @RequestBody LocationUpdateRequest updateRequest) {
        locationService.updateLocation(id, updateRequest);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }
}