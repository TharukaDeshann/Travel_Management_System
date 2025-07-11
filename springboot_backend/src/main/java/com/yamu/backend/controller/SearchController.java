package com.yamu.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

import com.yamu.backend.dto.SearchResponse;
import com.yamu.backend.service.AzureSearchService;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*") // For testing - restrict this in production
public class SearchController {
    
    @Autowired
    private AzureSearchService searchService;
    
    // Basic health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Search service is running");
    }
    
    // Simple search endpoint for testing
    @GetMapping("/test")
    public ResponseEntity<SearchResponse> testSearch() {
        try {
            SearchResponse response = searchService.searchUsers("*", null, 0, 5);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Main search endpoint
    @GetMapping("/users")
    public ResponseEntity<SearchResponse> searchUsers(
            @RequestParam(required = false, defaultValue = "*") String query,
            @RequestParam(required = false) List<String> role,
            @RequestParam(required = false) List<String> nationality,
            @RequestParam(required = false) List<String> city,
            @RequestParam(required = false) List<String> language,
            @RequestParam(required = false, defaultValue = "false") boolean verified,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = new ArrayList<>();
            
            if (role != null && !role.isEmpty()) {
                String roleFilter = role.stream()
                    .map(r -> "role eq '" + r + "'")
                    .collect(Collectors.joining(" or "));
                filters.add("(" + roleFilter + ")");
            }
            
            if (nationality != null && !nationality.isEmpty()) {
                String nationalityFilter = nationality.stream()
                    .map(n -> "nationality eq '" + n + "'")
                    .collect(Collectors.joining(" or "));
                filters.add("(" + nationalityFilter + ")");
            }
            
            if (city != null && !city.isEmpty()) {
                String cityFilter = city.stream()
                    .map(c -> "search.ismatch('" + c + "', 'expertise_city_region')")
                    .collect(Collectors.joining(" or "));
                filters.add("(" + cityFilter + ")");
            }
            
            if (language != null && !language.isEmpty()) {
                String languageFilter = language.stream()
                    .map(l -> "search.ismatch('" + l + "', 'guide_language')")
                    .collect(Collectors.joining(" or "));
                filters.add("(" + languageFilter + ")");
            }
            
            if (verified) {
                filters.add("is_verified eq true");
            }
            
            SearchResponse response = searchService.searchUsers(query, filters, page, size);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Suggestions endpoint
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
    
    // Debug endpoint to check configuration
    @GetMapping("/debug")
    public ResponseEntity<String> debug() {
        return ResponseEntity.ok("Azure Search Service initialized successfully");
    }
}