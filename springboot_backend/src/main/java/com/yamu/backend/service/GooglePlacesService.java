package com.yamu.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.yamu.backend.dto.HotelSearchRequestDTO;
import com.yamu.backend.model.Hotel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class GooglePlacesService {
    
    @Value("${google.places.api.key:}")
    private String apiKey;
    
    @Value("${google.places.api.url:https://maps.googleapis.com/maps/api/place}")
    private String apiUrl;
    
    private final RestTemplate restTemplate;
    
    public List<Hotel> searchHotelsAlongRoute(HotelSearchRequestDTO searchRequest) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Google Places API key not configured. Returning empty list.");
            return new ArrayList<>();
        }
        
        List<Hotel> allHotels = new ArrayList<>();
        
        try {
            // Calculate multiple search points along the route
            List<SearchPoint> searchPoints = calculateSearchPointsAlongRoute(
                searchRequest.getStartLatitude(), 
                searchRequest.getStartLongitude(),
                searchRequest.getEndLatitude(), 
                searchRequest.getEndLongitude()
            );
            
            // Search for hotels at each point along the route
            for (SearchPoint point : searchPoints) {
                List<Hotel> hotelsAtPoint = searchHotelsNearby(
                    point.latitude, 
                    point.longitude, 
                    searchRequest.getRadius() != null ? searchRequest.getRadius() : 5000,
                    searchRequest.getMinRating() != null ? searchRequest.getMinRating() : 3.0
                );
                allHotels.addAll(hotelsAtPoint);
            }
            
            // Remove duplicates based on Google Place ID
            allHotels = allHotels.stream()
                .filter(hotel -> hotel.getGooglePlaceId() != null)
                .collect(Collectors.toMap(
                    Hotel::getGooglePlaceId,
                    hotel -> hotel,
                    (existing, replacement) -> existing
                ))
                .values()
                .stream()
                .filter(hotel -> hotel.getRating() >= (searchRequest.getMinRating() != null ? searchRequest.getMinRating() : 3.0))
                .sorted((h1, h2) -> Double.compare(h2.getRating(), h1.getRating()))
                .limit(searchRequest.getMaxResults() != null ? searchRequest.getMaxResults() : 10)
                .collect(Collectors.toList());
            
            log.info("Found {} hotels along the route", allHotels.size());
            
        } catch (Exception e) {
            log.error("Error searching hotels along route: ", e);
        }
        
        return allHotels;
    }
    
    private List<SearchPoint> calculateSearchPointsAlongRoute(Double startLat, Double startLng, 
                                                            Double endLat, Double endLng) {
        List<SearchPoint> points = new ArrayList<>();
        
        // Add start point
        points.add(new SearchPoint(startLat, startLng));
        
        // Calculate intermediate points (every ~50km along the route)
        double totalDistance = calculateDistance(startLat, startLng, endLat, endLng);
        int numberOfPoints = Math.max(1, (int) (totalDistance / 50)); // Point every 50km
        
        for (int i = 1; i < numberOfPoints; i++) {
            double ratio = (double) i / numberOfPoints;
            double intermediateLat = startLat + (endLat - startLat) * ratio;
            double intermediateLng = startLng + (endLng - startLng) * ratio;
            points.add(new SearchPoint(intermediateLat, intermediateLng));
        }
        
        // Add end point
        points.add(new SearchPoint(endLat, endLng));
        
        return points;
    }
    
    private List<Hotel> searchHotelsNearby(Double latitude, Double longitude, 
                                         Double radius, Double minRating) {
        List<Hotel> hotels = new ArrayList<>();
        
        try {
            // Use smaller radius similar to Google Maps JavaScript API - max 5000m for nearby search
            Double searchRadius = Math.min(radius, 5000.0);
            
            String url = UriComponentsBuilder.fromUriString(apiUrl + "/nearbysearch/json")
                .queryParam("location", latitude + "," + longitude)
                .queryParam("radius", searchRadius.intValue())
                .queryParam("type", "lodging")
                .queryParam("key", apiKey)
                .toUriString();
            
            log.info("🌐 API CALL: Google Places for ({}, {}) radius={}m", latitude, longitude, searchRadius.intValue());
            log.info("🌐 API URL: {}", url.replace(apiKey, "***"));
            
            GooglePlacesResponse response = restTemplate.getForObject(url, GooglePlacesResponse.class);
            
            if (response != null) {
                log.info("🌐 API STATUS: {}", response.getStatus());
                
                if ("OK".equals(response.getStatus()) && response.getResults() != null) {
                    log.info("🌐 API RESPONSE: {} raw results", response.getResults().size());
                    
                    int validCount = 0;
                    int filteredCount = 0;
                    
                    for (GooglePlace place : response.getResults()) {
                        // More lenient approach - check rating first, then basic validation
                        if (place.getRating() != null && place.getRating() >= minRating) {
                            // Simplified validation - just check if it has basic info and is hotel-like
                            if (isBasicHotel(place)) {
                                Hotel hotel = convertGooglePlaceToHotel(place);
                                if (hotel != null) {
                                    hotels.add(hotel);
                                    validCount++;
                                    log.info("✅ ADDED: {} (Rating: {}, Types: {})", 
                                            hotel.getName(), hotel.getRating(), place.getTypes());
                                }
                            } else {
                                filteredCount++;
                                log.debug("❌ FILTERED: {} (Types: {})", place.getName(), place.getTypes());
                            }
                        } else {
                            log.debug("❌ LOW RATING: {} ({})", place.getName(), place.getRating());
                        }
                    }
                    
                    log.info("📊 FILTERING RESULTS: {} valid, {} filtered out", validCount, filteredCount);
                } else if ("ZERO_RESULTS".equals(response.getStatus())) {
                    log.warn("🌐 API: No hotels found in this area");
                } else {
                    log.warn("🌐 API ERROR: Status {} - {}", response.getStatus(), 
                            getApiErrorMessage(response.getStatus()));
                }
            } else {
                log.warn("🌐 API RESPONSE: Null response from Google Places API");
            }
            
        } catch (Exception e) {
            log.error("🌐 API ERROR: Error calling Google Places API for location {},{}: ", latitude, longitude, e);
        }
        
        log.info("🏨 LOCATION RESULT: {} hotels near ({}, {})", hotels.size(), latitude, longitude);
        return hotels;
    }
    
    private String getApiErrorMessage(String status) {
        return switch (status) {
            case "OVER_QUERY_LIMIT" -> "API quota exceeded";
            case "REQUEST_DENIED" -> "API key invalid or request denied";
            case "INVALID_REQUEST" -> "Invalid request parameters";
            case "ZERO_RESULTS" -> "No results found";
            default -> "Unknown error: " + status;
        };
    }
    
    // Simplified hotel validation - more permissive approach
    private boolean isBasicHotel(GooglePlace place) {
        // Check basic required fields
        if (place.getName() == null || place.getName().trim().isEmpty()) {
            return false;
        }
        
        if (place.getPlaceId() == null || place.getPlaceId().trim().isEmpty()) {
            return false;
        }
        
        if (place.getGeometry() == null || place.getGeometry().getLocation() == null) {
            return false;
        }
        
        // Must have lodging type - this is the main filter like the JavaScript code
        if (place.getTypes() != null && !place.getTypes().contains("lodging")) {
            return false;
        }
        
        // Simple name exclusions for obvious non-hotels
        String name = place.getName().toLowerCase();
        if (name.contains("gas station") || name.contains("hospital") || 
            name.contains("bank") || name.contains("restaurant")) {
            return false;
        }
        
        return true;
    }
    
    private Hotel convertGooglePlaceToHotel(GooglePlace place) {
        try {
            Hotel hotel = new Hotel();
            hotel.setGooglePlaceId(place.getPlaceId());
            hotel.setName(place.getName());
            hotel.setAddress(place.getVicinity() != null ? place.getVicinity() : "Address not available");
            
            if (place.getGeometry() != null && place.getGeometry().getLocation() != null) {
                hotel.setLatitude(place.getGeometry().getLocation().getLat());
                hotel.setLongitude(place.getGeometry().getLocation().getLng());
            }
            
            hotel.setRating(place.getRating() != null ? place.getRating() : 3.0);
            hotel.setTotalRatings(place.getUserRatingsTotal() != null ? place.getUserRatingsTotal() : 0);
            hotel.setPriceLevel(place.getPriceLevel() != null ? place.getPriceLevel() : 2);
            
            // Set photo reference if available
            if (place.getPhotos() != null && !place.getPhotos().isEmpty()) {
                hotel.setPhotoReference(place.getPhotos().get(0).getPhotoReference());
            }
            
            return hotel;
            
        } catch (Exception e) {
            log.error("Error converting Google Place to Hotel: ", e);
            return null;
        }
    }
    
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        // Haversine formula to calculate distance between two points
        final int EARTH_RADIUS = 6371; // Earth's radius in kilometers
        
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS * c; // Distance in kilometers
    }
    
    public String generatePhotoUrl(String photoReference) {
        if (apiKey == null || apiKey.isEmpty()) {
            // Return a placeholder image URL when API key is not available
            return "https://via.placeholder.com/400x300/0066cc/ffffff?text=Hotel+Image";
        }
        
        return String.format(
            "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=%s&key=%s",
            photoReference, apiKey
        );
    }
    
    // TODO: Enhanced features to implement:
    // 1. Places Details API for more hotel information
    // 2. Route optimization for better search coverage
    // 3. Caching for frequently searched routes
    // 4. Integration with Google Directions API for accurate route calculation
    
    // Data classes for Google Places API responses
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GooglePlacesResponse {
        private List<GooglePlace> results;
        private String status;
        @JsonProperty("next_page_token")
        private String nextPageToken;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GooglePlace {
        @JsonProperty("place_id")
        private String placeId;
        private String name;
        private String vicinity;
        private Double rating;
        @JsonProperty("user_ratings_total")
        private Integer userRatingsTotal;
        @JsonProperty("price_level")
        private Integer priceLevel;
        private PlaceGeometry geometry;
        private List<PlacePhoto> photos;
        private List<String> types;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PlaceGeometry {
        private PlaceLocation location;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PlaceLocation {
        private Double lat;
        private Double lng;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PlacePhoto {
        @JsonProperty("photo_reference")
        private String photoReference;
        private Integer height;
        private Integer width;
    }
    
    @Data
    @AllArgsConstructor
    private static class SearchPoint {
        private final Double latitude;
        private final Double longitude;
    }
}
