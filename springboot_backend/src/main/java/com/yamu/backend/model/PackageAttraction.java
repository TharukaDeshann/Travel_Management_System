package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "package_attractions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageAttraction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private TravelPackage travelPackage;
    
    @Column(nullable = false, length = 200)
    private String attractionName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(length = 500)
    private String address;
    
    @Column(nullable = false)
    private Integer visitOrder; // Order of visit during the trip
    
    @Column(precision = 8, scale = 2)
    private BigDecimal entranceFee;
    
    @Column(length = 500)
    private String imageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String visitingTips;
    
    @Column(nullable = false)
    private Boolean isMainAttraction = false;
} 