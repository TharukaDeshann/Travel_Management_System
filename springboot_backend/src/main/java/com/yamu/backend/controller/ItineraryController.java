package com.yamu.backend.controller;

import com.yamu.backend.dto.ItineraryRequest;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {
    @Autowired
    private ItineraryService itineraryService;

    @PostMapping
    public Itinerary createItinerary(@RequestBody ItineraryRequest request) {
        return itineraryService.saveItinerary(request);
    }
}