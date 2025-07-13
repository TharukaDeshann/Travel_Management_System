package com.yamu.backend.dto;

import com.yamu.backend.model.Hotel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelResponseDTO {
    
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer totalRatings;
    private Integer priceLevel;
    private String googlePlaceId;
    private String phoneNumber;
    private String websiteUrl;
    private String photoUrl; // Constructed photo URL
    private Hotel.MockDataTemplate mockDataTemplate;
    private Double distanceFromRoute; // Distance in kilometers from the route
    private List<String> amenities; // From mock data
    private RoomAvailabilityDTO roomAvailability; // From mock data
}
