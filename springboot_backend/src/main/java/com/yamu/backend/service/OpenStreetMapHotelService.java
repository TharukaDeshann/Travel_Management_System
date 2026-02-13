package com.yamu.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yamu.backend.dto.HotelSearchRequestDTO;
import com.yamu.backend.model.Hotel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class OpenStreetMapHotelService {
    
    private final RestTemplate restTemplate;
    
    public List<Hotel> searchHotelsAlongRoute(HotelSearchRequestDTO searchRequest) {
        List<Hotel> allHotels = new ArrayList<>();
        
        try {
            // Calculate multiple search points along the route
            List<SearchPoint> searchPoints = calculateSearchPointsAlongRoute(
                searchRequest.getStartLatitude(), 
                searchRequest.getStartLongitude(),
                searchRequest.getEndLatitude(), 
                searchRequest.getEndLongitude()
            );
            
            log.info("🗺️ OSM SEARCH: {} search points generated", searchPoints.size());
            
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
            
            // Remove duplicates based on OSM ID
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
            
            log.info("🏨 OSM TOTAL: Found {} hotels along the route", allHotels.size());
            
        } catch (Exception e) {
            log.error("🗺️ OSM ERROR: Error searching hotels along route: ", e);
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
        
        // Add end point if different from start
        if (numberOfPoints > 1) {
            points.add(new SearchPoint(endLat, endLng));
        }
        
        return points;
    }
    
    private List<Hotel> searchHotelsNearby(Double latitude, Double longitude, 
                                         Double radius, Double minRating) {
        List<Hotel> hotels = new ArrayList<>();
        
        try {
            log.info("🗺️ OSM API CALL: Searching for hotels near ({}, {}) radius={}m", 
                    latitude, longitude, radius);
            
            // Overpass API query for hotels around the location
            String overpassQuery = String.format(
                "[out:json][timeout:25];" +
                "(" +
                "  node[\"tourism\"=\"hotel\"](around:%d,%f,%f);" +
                "  node[\"tourism\"=\"motel\"](around:%d,%f,%f);" +
                "  node[\"tourism\"=\"guest_house\"](around:%d,%f,%f);" +
                "  node[\"tourism\"=\"hostel\"](around:%d,%f,%f);" +
                "  way[\"tourism\"=\"hotel\"](around:%d,%f,%f);" +
                "  way[\"tourism\"=\"motel\"](around:%d,%f,%f);" +
                "  way[\"tourism\"=\"guest_house\"](around:%d,%f,%f);" +
                "  way[\"tourism\"=\"hostel\"](around:%d,%f,%f);" +
                ");" +
                "out center meta;",
                radius.intValue(), latitude, longitude,
                radius.intValue(), latitude, longitude,
                radius.intValue(), latitude, longitude,
                radius.intValue(), latitude, longitude,
                radius.intValue(), latitude, longitude,
                radius.intValue(), latitude, longitude,
                radius.intValue(), latitude, longitude,
                radius.intValue(), latitude, longitude
            );
            
            String overpassUrl = "https://overpass-api.de/api/interpreter";
            
            // Create form data for POST request
            LinkedMultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("data", overpassQuery);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            // Make the API call
            OverpassResponse response = restTemplate.postForObject(overpassUrl, request, OverpassResponse.class);
            
            if (response != null && response.getElements() != null) {
                log.info("🗺️ OSM RESPONSE: {} raw results", response.getElements().size());
                
                // LOG RAW API RESPONSE
                log.info("🔍 RAW OSM RESULTS:");
                for (int i = 0; i < Math.min(response.getElements().size(), 10); i++) {
                    OverpassElement element = response.getElements().get(i);
                    String name = element.getTags() != null ? element.getTags().get("name") : "Unknown";
                    String type = element.getTags() != null ? element.getTags().get("tourism") : "unknown";
                    Double lat = element.getLat() != null ? element.getLat() : 
                               (element.getCenter() != null ? element.getCenter().getLat() : null);
                    Double lon = element.getLon() != null ? element.getLon() : 
                               (element.getCenter() != null ? element.getCenter().getLon() : null);
                    
                    log.info("  [{}] NAME: {} | TYPE: {} | LAT/LNG: {},{}", 
                            i+1, name, type, lat, lon);
                }
                
                int validCount = 0;
                
                for (OverpassElement element : response.getElements()) {
                    Hotel hotel = convertOverpassElementToHotel(element);
                    if (hotel != null && hotel.getRating() >= minRating) {
                        hotels.add(hotel);
                        validCount++;
                        log.info("✅ OSM ADDED: {} (Generated Rating: {})", 
                                hotel.getName(), hotel.getRating());
                    }
                }
                
                log.info("📊 OSM RESULTS: {} valid hotels from {} total", validCount, response.getElements().size());
            } else {
                log.warn("🗺️ OSM RESPONSE: No results or null response");
            }
            
        } catch (Exception e) {
            log.error("🗺️ OSM ERROR: Error calling OpenStreetMap Overpass API: ", e);
        }
        
        log.info("🏨 OSM LOCATION RESULT: {} hotels near ({}, {})", hotels.size(), latitude, longitude);
        return hotels;
    }
    
    private Hotel convertOverpassElementToHotel(OverpassElement element) {
        try {
            if (element.getTags() == null || element.getTags().get("name") == null) {
                return null; // Skip elements without names
            }
            
            Hotel hotel = new Hotel();
            
            // Set the actual OSM ID as the hotel ID
            hotel.setId(element.getId());
            
            // Generate a unique identifier based on OSM ID
            hotel.setGooglePlaceId("osm_" + element.getId());
            hotel.setName(element.getTags().get("name"));
            
            // Get coordinates
            Double lat = element.getLat();
            Double lon = element.getLon();
            
            // For ways, use center coordinates
            if (lat == null && element.getCenter() != null) {
                lat = element.getCenter().getLat();
                lon = element.getCenter().getLon();
            }
            
            if (lat != null && lon != null) {
                hotel.setLatitude(lat);
                hotel.setLongitude(lon);
            } else {
                return null; // Skip without coordinates
            }
            
            // Build address from available tags
            StringBuilder address = new StringBuilder();
            if (element.getTags().get("addr:street") != null) {
                address.append(element.getTags().get("addr:street"));
            }
            if (element.getTags().get("addr:city") != null) {
                if (address.length() > 0) address.append(", ");
                address.append(element.getTags().get("addr:city"));
            }
            if (element.getTags().get("addr:country") != null) {
                if (address.length() > 0) address.append(", ");
                address.append(element.getTags().get("addr:country"));
            }
            if (address.length() == 0) {
                address.append("Sri Lanka"); // Default for our use case
            }
            hotel.setAddress(address.toString());
            
            // Generate realistic mock data based on hotel type
            String tourismType = element.getTags().get("tourism");
            double baseRating = switch (tourismType) {
                case "hotel" -> 3.5 + (Math.random() * 1.5); // 3.5 to 5.0
                case "guest_house" -> 3.0 + (Math.random() * 1.5); // 3.0 to 4.5
                case "motel" -> 2.5 + (Math.random() * 1.5); // 2.5 to 4.0
                case "hostel" -> 3.0 + (Math.random() * 1.0); // 3.0 to 4.0
                default -> 3.0 + (Math.random() * 2.0); // 3.0 to 5.0
            };
            
            hotel.setRating(Math.round(baseRating * 10.0) / 10.0); // Round to 1 decimal
            hotel.setTotalRatings((int)(Math.random() * 500) + 50); // 50 to 550 reviews
            
            // Price level based on type and rating
            int priceLevel = hotel.getRating() > 4.0 ? 3 : hotel.getRating() > 3.5 ? 2 : 1;
            hotel.setPriceLevel(priceLevel);
            
            return hotel;
            
        } catch (Exception e) {
            log.error("🗺️ OSM ERROR: Error converting Overpass element to Hotel: ", e);
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
    
    // Data classes for OpenStreetMap Overpass API responses
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OverpassResponse {
        private String version;
        private String generator;
        private List<OverpassElement> elements;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OverpassElement {
        private String type;
        private Long id;
        private Double lat;
        private Double lon;
        private Map<String, String> tags;
        private OverpassCenter center;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OverpassCenter {
        private Double lat;
        private Double lon;
    }
    
    @Data
    private static class SearchPoint {
        private final Double latitude;
        private final Double longitude;
        
        public SearchPoint(Double latitude, Double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }
}
