package com.yamu.backend.controller;

import com.yamu.backend.dto.ItineraryCreateRequest;
import com.yamu.backend.dto.ItineraryDetailResponse;
import com.yamu.backend.service.ItineraryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;
    
    /**
     * Create a new itinerary with all its day plans, routes, and locations
     */
    @PostMapping
    public ResponseEntity<ItineraryDetailResponse> createItinerary(
            @Valid @RequestBody ItineraryCreateRequest request) {
        ItineraryDetailResponse response = itineraryService.createItinerary(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Get an itinerary by id with all its details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ItineraryDetailResponse> getItineraryById(@PathVariable Long id) {
        ItineraryDetailResponse response = itineraryService.getItineraryById(id);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all itineraries for a traveler
     */
    @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<List<ItineraryDetailResponse>> getItinerariesByTravelerId(
            @PathVariable Long travelerId) {
        List<ItineraryDetailResponse> responses = itineraryService.getItinerariesByTravelerId(travelerId);
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Update an existing itinerary
     */
    @PutMapping("/{id}")
    public ResponseEntity<ItineraryDetailResponse> updateItinerary(
            @PathVariable Long id,
            @Valid @RequestBody ItineraryCreateRequest request) {
        ItineraryDetailResponse response = itineraryService.updateItinerary(id, request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete an itinerary
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(@PathVariable Long id) {
        itineraryService.deleteItinerary(id);
        return ResponseEntity.noContent().build();
    }
}