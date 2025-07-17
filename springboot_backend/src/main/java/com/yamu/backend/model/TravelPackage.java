package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "travel_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelPackage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String name; // e.g., "Watch Sigiriya Package"
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, length = 100)
    private String mainAttraction; // e.g., "Sigiriya"
    
    @Column(nullable = false)
    private Integer durationDays;
    
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalBudget;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hotelCost;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal guideCost;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal transportCost;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal attractionCost;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_guide_id")
    private Guide assignedGuide;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_driver_id")
    private Driver assignedDriver;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel assignedHotel;
    
    @OneToMany(mappedBy = "travelPackage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PackageAttraction> attractions;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(nullable = false)
    private Integer maxTravelers = 1;
    
    @Column(length = 500)
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PackageCategory category = PackageCategory.CULTURAL;
    
    public enum PackageCategory {
        CULTURAL, ADVENTURE, NATURE, RELIGIOUS, BEACH, CITY_TOUR, WILDLIFE
    }
} 