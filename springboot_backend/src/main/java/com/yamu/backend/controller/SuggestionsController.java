package com.yamu.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.yamu.backend.service.AzureSearchService;

@RestController
@RequestMapping("/api")
public class SuggestionsController {
    private final AzureSearchService searchService;

    public SuggestionsController(AzureSearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String query) {
        try {
            List<String> suggestions = searchService.getSuggestions(query);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

}
