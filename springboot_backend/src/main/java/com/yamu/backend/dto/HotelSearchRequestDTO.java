package com.yamu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelSearchRequestDTO {
    
    private Double startLatitude;
    private Double startLongitude;
    private Double endLatitude;
    private Double endLongitude;
    private Double radius; // Search radius in meters (default: 5000)
    private Double minRating; // Minimum rating filter (default: 3.0)
    private Integer maxResults; // Maximum number of results (default: 10)
    private String priceLevel; // LOW, MEDIUM, HIGH, LUXURY
    private List<String> amenities; // Optional amenities filter
}
