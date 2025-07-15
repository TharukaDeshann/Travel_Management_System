package com.yamu.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Collectors;

import com.yamu.backend.dto.GuideSearchResponse;
import com.yamu.backend.dto.GuideSearchResult;
import com.yamu.backend.service.GuideSearchService;

@RestController
@RequestMapping("/api/search/guides")
public class GuideSearchController {
    
    @Autowired
    private GuideSearchService guideSearchService;
    
    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Guide search service is running");
    }
    
    // Main search endpoint for guides
    @GetMapping
    public ResponseEntity<GuideSearchResponse> searchGuides(
            @RequestParam(required = false, defaultValue = "*") String query,
            @RequestParam(required = false) List<String> region,
            @RequestParam(required = false) List<String> language,
            @RequestParam(required = false) List<String> vehicleType,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) Boolean airConditioned,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) List<String> reservationStatus,
            @RequestParam(required = false) String orderBy,
            @RequestParam(required = false) List<String> facets,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = buildFilters(region, language, vehicleType, minCapacity, maxCapacity, 
                                              airConditioned, available, verified, minRating, minPrice, maxPrice, reservationStatus);
            
            GuideSearchResponse response = guideSearchService.searchGuides(query, filters, page, size, orderBy, facets);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Search guides by specific places
    @GetMapping("/by-places")
    public ResponseEntity<GuideSearchResponse> searchGuidesByPlaces(
            @RequestParam List<String> places,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = new ArrayList<>();
            String placesFilter = places.stream()
                .map(place -> "search.ismatch('" + place + "', 'reservation_places')")
                .collect(Collectors.joining(" or "));
            filters.add("(" + placesFilter + ")");
            
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, null, null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get guides with highest ratings
    @GetMapping("/top-rated")
    public ResponseEntity<GuideSearchResponse> getTopRatedGuides(
            @RequestParam(defaultValue = "4") int minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = Arrays.asList("average_rating ge " + minRating);
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, "average_rating desc", null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get guides with available vehicles
    @GetMapping("/available-vehicles")
    public ResponseEntity<GuideSearchResponse> getGuidesWithAvailableVehicles(
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Boolean airConditioned,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = new ArrayList<>();
            filters.add("vehicle_available eq true");
            
            if (vehicleType != null && !vehicleType.isEmpty()) {
                filters.add("vehicle_type eq '" + vehicleType + "'");
            }
            
            if (minCapacity != null) {
                filters.add("vehicle_capacity ge " + minCapacity);
            }
            
            if (airConditioned != null) {
                filters.add("vehicle_air_conditioned eq " + airConditioned);
            }
            
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, null, null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get specific guide by ID
    @GetMapping("/{guideId}")
    public ResponseEntity<GuideSearchResult> getGuideById(@PathVariable String guideId) {
        try {
            GuideSearchResult guide = guideSearchService.getGuideById(guideId);
            if (guide != null) {
                return ResponseEntity.ok(guide);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get suggestions for autocomplete
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String query) {
        try {
            List<String> suggestions = guideSearchService.getSuggestions(query);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get faceted search results
    @GetMapping("/faceted")
    public ResponseEntity<GuideSearchResponse> getFacetedSearch(
            @RequestParam(required = false, defaultValue = "*") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> facetFields = Arrays.asList(
                "expertise_city_region", "guide_language", "vehicle_type", 
                "vehicle_capacity", "reservation_status", "average_rating"
            );
            
            GuideSearchResponse response = guideSearchService.searchGuides(query, null, page, size, null, facetFields);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Search guides by expertise/region
    @GetMapping("/by-region")
    public ResponseEntity<GuideSearchResponse> searchGuidesByRegion(
            @RequestParam String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = Arrays.asList("search.ismatch('" + region + "', 'expertise_city_region')");
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, null, null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Search guides by language
    @GetMapping("/by-language")
    public ResponseEntity<GuideSearchResponse> searchGuidesByLanguage(
            @RequestParam String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = Arrays.asList("search.ismatch('" + language + "', 'guide_language')");
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, null, null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // // Get guides with recent reviews
    // @GetMapping("/recent-reviews")
    // public ResponseEntity<GuideSearchResponse> getGuidesWithRecentReviews(
    //         @RequestParam(required = false) Integer minRating,
    //         @RequestParam(defaultValue = "30") int daysSince,
    //         @RequestParam(defaultValue = "0") int page,
    //         @RequestParam(defaultValue = "10") int size) {
        
    //     try {
    //         List<String> filters = new ArrayList<>();
    //         filters.add("review_created_at ge " + java.time.LocalDateTime.now().minusDays(daysSince).toString());
            
    //         if (minRating != null) {
    //             filters.add("review_rating ge " + minRating);
    //         }
            
    //         GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, "review_created_at desc", null);
    //         return ResponseEntity.ok(response);
            
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return ResponseEntity.internalServerError().build();
    //     }
    // }
    
    // Get guides with specific reservation status
    @GetMapping("/by-reservation-status")
    public ResponseEntity<GuideSearchResponse> getGuidesByReservationStatus(
            @RequestParam String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = Arrays.asList("reservation_status eq '" + status + "'");
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, null, null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get guides with upcoming reservations
    @GetMapping("/upcoming-reservations")
    public ResponseEntity<GuideSearchResponse> getGuidesWithUpcomingReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = Arrays.asList("reservation_status eq 'confirmed'");
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, "reservation_created_at desc", null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get most experienced guides (based on completed reservations)
    @GetMapping("/most-experienced")
    public ResponseEntity<GuideSearchResponse> getMostExperiencedGuides(
            @RequestParam(defaultValue = "5") int minCompletedReservations,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = Arrays.asList("completed_reservations ge " + minCompletedReservations);
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, "completed_reservations desc", null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get guides with multiple vehicles
    @GetMapping("/multi-vehicle")
    public ResponseEntity<GuideSearchResponse> getGuidesWithMultipleVehicles(
            @RequestParam(defaultValue = "2") int minVehicles,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<String> filters = Arrays.asList("total_vehicles ge " + minVehicles);
            GuideSearchResponse response = guideSearchService.searchGuides("*", filters, page, size, "total_vehicles desc", null);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Advanced search with multiple criteria
    @PostMapping("/advanced-search")
    public ResponseEntity<GuideSearchResponse> advancedSearch(@RequestBody AdvancedSearchRequest request) {
        try {
            List<String> filters = buildAdvancedFilters(request);
            GuideSearchResponse response = guideSearchService.searchGuides(
                request.getQuery() != null ? request.getQuery() : "*", 
                filters, 
                request.getPage(), 
                request.getSize(), 
                request.getOrderBy(), 
                request.getFacets()
            );
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get aggregated statistics
    @GetMapping("/stats")
    public ResponseEntity<GuideStatsResponse> getGuideStats() {
        try {
            // This would typically require a separate service method to aggregate statistics
            // For now, we'll return basic stats by searching with facets
            List<String> facetFields = Arrays.asList(
                "expertise_city_region", "guide_language", "vehicle_type", 
                "vehicle_capacity", "reservation_status", "average_rating"
            );
            
            GuideSearchResponse response = guideSearchService.searchGuides("*", null, 0, 0, null, facetFields);
            
            GuideStatsResponse stats = new GuideStatsResponse();
            stats.setTotalGuides(response.getTotalCount());
            stats.setFacets(response.getFacets());
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Helper method to build filters
    private List<String> buildFilters(List<String> region, List<String> language, List<String> vehicleType,
                                     Integer minCapacity, Integer maxCapacity, Boolean airConditioned,
                                     Boolean available, Boolean verified, Integer minRating,
                                     Double minPrice, Double maxPrice, List<String> reservationStatus) {
        List<String> filters = new ArrayList<>();
        
        if (region != null && !region.isEmpty()) {
            String regionFilter = region.stream()
                .map(r -> "search.ismatch('" + r + "', 'expertise_city_region')")
                .collect(Collectors.joining(" or "));
            filters.add("(" + regionFilter + ")");
        }
        
        if (language != null && !language.isEmpty()) {
            String languageFilter = language.stream()
                .map(l -> "search.ismatch('" + l + "', 'guide_language')")
                .collect(Collectors.joining(" or "));
            filters.add("(" + languageFilter + ")");
        }
        
        if (vehicleType != null && !vehicleType.isEmpty()) {
            String vehicleFilter = vehicleType.stream()
                .map(vt -> "vehicle_type eq '" + vt + "'")
                .collect(Collectors.joining(" or "));
            filters.add("(" + vehicleFilter + ")");
        }
        
        if (minCapacity != null) {
            filters.add("vehicle_capacity ge " + minCapacity);
        }
        
        if (maxCapacity != null) {
            filters.add("vehicle_capacity le " + maxCapacity);
        }
        
        if (airConditioned != null) {
            filters.add("vehicle_air_conditioned eq " + airConditioned);
        }
        
        if (available != null) {
            filters.add("vehicle_available eq " + available);
        }
        
        if (verified != null) {
            filters.add("is_verified eq " + verified);
        }
        
        if (minRating != null) {
            filters.add("average_rating ge " + minRating);
        }
        
        if (minPrice != null) {
            filters.add("estimated_price ge " + minPrice);
        }
        
        if (maxPrice != null) {
            filters.add("estimated_price le " + maxPrice);
        }
        
        if (reservationStatus != null && !reservationStatus.isEmpty()) {
            String statusFilter = reservationStatus.stream()
                .map(rs -> "reservation_status eq '" + rs + "'")
                .collect(Collectors.joining(" or "));
            filters.add("(" + statusFilter + ")");
        }
        
        return filters;
    }
    
    // Helper method to build advanced filters
    private List<String> buildAdvancedFilters(AdvancedSearchRequest request) {
        List<String> filters = new ArrayList<>();
        
        if (request.getRegions() != null && !request.getRegions().isEmpty()) {
            String regionFilter = request.getRegions().stream()
                .map(r -> "search.ismatch('" + r + "', 'expertise_city_region')")
                .collect(Collectors.joining(" or "));
            filters.add("(" + regionFilter + ")");
        }
        
        if (request.getLanguages() != null && !request.getLanguages().isEmpty()) {
            String languageFilter = request.getLanguages().stream()
                .map(l -> "search.ismatch('" + l + "', 'guide_language')")
                .collect(Collectors.joining(" or "));
            filters.add("(" + languageFilter + ")");
        }
        
        if (request.getVehicleTypes() != null && !request.getVehicleTypes().isEmpty()) {
            String vehicleFilter = request.getVehicleTypes().stream()
                .map(vt -> "vehicle_type eq '" + vt + "'")
                .collect(Collectors.joining(" or "));
            filters.add("(" + vehicleFilter + ")");
        }
        
        if (request.getMinCapacity() != null) {
            filters.add("vehicle_capacity ge " + request.getMinCapacity());
        }
        
        if (request.getMaxCapacity() != null) {
            filters.add("vehicle_capacity le " + request.getMaxCapacity());
        }
        
        if (request.getAirConditioned() != null) {
            filters.add("vehicle_air_conditioned eq " + request.getAirConditioned());
        }
        
        if (request.getVerified() != null) {
            filters.add("is_verified eq " + request.getVerified());
        }
        
        if (request.getMinRating() != null) {
            filters.add("average_rating ge " + request.getMinRating());
        }
        
        if (request.getMinPrice() != null) {
            filters.add("estimated_price ge " + request.getMinPrice());
        }
        
        if (request.getMaxPrice() != null) {
            filters.add("estimated_price le " + request.getMaxPrice());
        }
        
        if (request.getReservationStatuses() != null && !request.getReservationStatuses().isEmpty()) {
            String statusFilter = request.getReservationStatuses().stream()
                .map(rs -> "reservation_status eq '" + rs + "'")
                .collect(Collectors.joining(" or "));
            filters.add("(" + statusFilter + ")");
        }
        
        if (request.getDateRangeStart() != null) {
            filters.add("reservation_created_at ge " + request.getDateRangeStart());
        }
        
        if (request.getDateRangeEnd() != null) {
            filters.add("reservation_created_at le " + request.getDateRangeEnd());
        }
        
        return filters;
    }
    
    // Inner classes for request/response DTOs
    public static class AdvancedSearchRequest {
        private String query;
        private List<String> regions;
        private List<String> languages;
        private List<String> vehicleTypes;
        private Integer minCapacity;
        private Integer maxCapacity;
        private Boolean airConditioned;
        private Boolean verified;
        private Integer minRating;
        private Double minPrice;
        private Double maxPrice;
        private List<String> reservationStatuses;
        private String dateRangeStart;
        private String dateRangeEnd;
        private String orderBy;
        private List<String> facets;
        private int page = 0;
        private int size = 10;
        
        // Getters and setters
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        
        public List<String> getRegions() { return regions; }
        public void setRegions(List<String> regions) { this.regions = regions; }
        
        public List<String> getLanguages() { return languages; }
        public void setLanguages(List<String> languages) { this.languages = languages; }
        
        public List<String> getVehicleTypes() { return vehicleTypes; }
        public void setVehicleTypes(List<String> vehicleTypes) { this.vehicleTypes = vehicleTypes; }
        
        public Integer getMinCapacity() { return minCapacity; }
        public void setMinCapacity(Integer minCapacity) { this.minCapacity = minCapacity; }
        
        public Integer getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
        
        public Boolean getAirConditioned() { return airConditioned; }
        public void setAirConditioned(Boolean airConditioned) { this.airConditioned = airConditioned; }
        
        public Boolean getVerified() { return verified; }
        public void setVerified(Boolean verified) { this.verified = verified; }
        
        public Integer getMinRating() { return minRating; }
        public void setMinRating(Integer minRating) { this.minRating = minRating; }
        
        public Double getMinPrice() { return minPrice; }
        public void setMinPrice(Double minPrice) { this.minPrice = minPrice; }
        
        public Double getMaxPrice() { return maxPrice; }
        public void setMaxPrice(Double maxPrice) { this.maxPrice = maxPrice; }
        
        public List<String> getReservationStatuses() { return reservationStatuses; }
        public void setReservationStatuses(List<String> reservationStatuses) { this.reservationStatuses = reservationStatuses; }
        
        public String getDateRangeStart() { return dateRangeStart; }
        public void setDateRangeStart(String dateRangeStart) { this.dateRangeStart = dateRangeStart; }
        
        public String getDateRangeEnd() { return dateRangeEnd; }
        public void setDateRangeEnd(String dateRangeEnd) { this.dateRangeEnd = dateRangeEnd; }
        
        public String getOrderBy() { return orderBy; }
        public void setOrderBy(String orderBy) { this.orderBy = orderBy; }
        
        public List<String> getFacets() { return facets; }
        public void setFacets(List<String> facets) { this.facets = facets; }
        
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
    }
    
    public static class GuideStatsResponse {
        private long totalGuides;
        private java.util.Map<String, List<String>> facets;
        
        public long getTotalGuides() { return totalGuides; }
        public void setTotalGuides(long totalGuides) { this.totalGuides = totalGuides; }
        
        public java.util.Map<String, List<String>> getFacets() { return facets; }
        public void setFacets(java.util.Map<String, List<String>> facets) { this.facets = facets; }
    }
}