package com.yamu.backend.controller;

import com.yamu.backend.dto.ItineraryRequest;
import com.yamu.backend.dto.ItineraryResponse;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.service.ItineraryService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {
    private final ItineraryService itService;

    public ItineraryController(ItineraryService itService) {
        this.itService = itService;
    }

    @PostMapping
    public ResponseEntity<ItineraryResponse> create(@Valid @RequestBody ItineraryRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itService.create(dto));
    }
}
