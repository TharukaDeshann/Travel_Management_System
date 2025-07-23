package com.yamu.backend.controller;

import com.yamu.backend.dto.ItineraryCreateRequest;
import com.yamu.backend.dto.ItineraryDetailResponse;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.stream.Collectors;
import java.util.List;
import com.yamu.backend.dto.ItinerarySummaryResponseDTO;

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

    @GetMapping("/{id}")
    public ResponseEntity<ItineraryDetailResponse> getItineraryById(@PathVariable Long id) {
        Optional<Itinerary> itineraryOpt = itineraryService.getItineraryById(id);
        if (itineraryOpt.isPresent()) {
            Itinerary itinerary = itineraryOpt.get();
            ItineraryDetailResponse response = itineraryService.mapToDetailResponse(itinerary);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<List<ItineraryDetailResponse>> getItinerariesByTraveler(@PathVariable Long travelerId) {
        List<Itinerary> itineraries = itineraryService.getItinerariesByTravelerId(travelerId);
        List<ItineraryDetailResponse> response = itineraries.stream()
            .map(itineraryService::mapToDetailResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/traveler/{travelerId}/summary")
    public ResponseEntity<List<ItinerarySummaryResponseDTO>> getItinerarySummariesByTraveler(@PathVariable Long travelerId) {
        List<ItinerarySummaryResponseDTO> summaries = itineraryService.getItinerarySummariesByTravelerId(travelerId);
        return ResponseEntity.ok(summaries);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItinerary(@PathVariable Long id) {
        Optional<Itinerary> itineraryOpt = itineraryService.getItineraryById(id);
        if (itineraryOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        itineraryService.deleteItinerary(id);
        return ResponseEntity.ok().build();
    }
}