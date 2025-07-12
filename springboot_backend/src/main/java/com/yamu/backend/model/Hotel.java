package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {
    
    @Id
    private Long id; // Remove auto-generation to allow manual setting of OSM IDs
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String address;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(nullable = false)
    private Double rating;
    
    @Column(name = "total_ratings")
    private Integer totalRatings;
    
    @Column(name = "price_level")
    private Integer priceLevel; // 1-4 scale from Google Places
    
    @Column(name = "google_place_id", unique = true)
    private String googlePlaceId;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "website_url")
    private String websiteUrl;
    
    @Column(name = "photo_reference")
    private String photoReference;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "mock_data_template")
    private MockDataTemplate mockDataTemplate;
    
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HotelBooking> bookings;
    
    // Mock data template enum to randomly assign infrastructure data
    public enum MockDataTemplate {
        LUXURY_RESORT,
        BUSINESS_HOTEL,
        BOUTIQUE_HOTEL,
        BUDGET_INN,
        CITY_CENTER_HOTEL
    }
}
