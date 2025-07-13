package com.yamu.backend.controller;

import com.yamu.backend.dto.ItineraryCreateRequest;
import com.yamu.backend.dto.ItineraryDetailResponse;
import com.yamu.backend.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {
  
    @Autowired
    private ItineraryService itineraryService;

    @PostMapping
    public ResponseEntity<ItineraryDetailResponse> createItinerary(@RequestBody ItineraryCreateRequest request) {
        ItineraryDetailResponse response = itineraryService.createItinerary(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}