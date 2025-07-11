package com.yamu.backend.service;

import com.yamu.backend.dto.HotelSearchRequestDTO;
import com.yamu.backend.model.Hotel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class GooglePlacesService {
    
    @Value("${google.places.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    
    public GooglePlacesService() {
        this.restTemplate = new RestTemplate();
    }
    
    public List<Hotel> searchHotelsAlongRoute(HotelSearchRequestDTO searchRequest) {
        // For now, return empty list since we don't have Google Places API configured
        // This will be implemented when Google Places API key is available
        log.info("Google Places API search would be performed here");
        log.info("Search parameters: radius={}, minRating={}", 
                searchRequest.getRadius(), searchRequest.getMinRating());
        
        // Return empty list - the service will use mock data instead
        return new ArrayList<>();
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
    
    // TODO: Implement actual Google Places API integration when API key is available
    // This would include:
    // 1. Places Nearby Search API
    // 2. Places Details API  
    // 3. Places Photos API
    // 4. Geocoding API for route calculations
}
