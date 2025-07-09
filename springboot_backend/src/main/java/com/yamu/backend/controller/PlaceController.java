package com.yamu.backend.controller;

import com.yamu.backend.model.Place;
import com.yamu.backend.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {
    
    @Autowired
    private PlaceRepository placeRepository;
    
    @GetMapping
    public ResponseEntity<List<Place>> getAllPlaces() {
        List<Place> places = placeRepository.findAll();
        return ResponseEntity.ok(places);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Place>> searchPlaces(@RequestParam String query) {
        List<Place> places = placeRepository.findByNameContainingIgnoreCase(query);
        return ResponseEntity.ok(places);
    }
}