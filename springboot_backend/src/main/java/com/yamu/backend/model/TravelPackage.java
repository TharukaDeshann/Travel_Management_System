package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    
    @Column(nullable = false, length = 100)
    private String packageName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Integer durationDays;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal budgetPerPerson;
    
    @Column(nullable = false, length = 3)
    private String currency = "LKR";
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PackageStatus status = PackageStatus.ACTIVE;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Selected hotel for the package
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel selectedHotel;
    
    // Selected vehicle for the package
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle selectedVehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id")
    private Guide selectedGuide;
    
    // Selected driver for the package (if different from vehicle's default)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver selectedDriver;
    
    // Package day plans
    @OneToMany(mappedBy = "travelPackage", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PackageDayPlan> dayPlans = new ArrayList<>();
    
    // Package applications from travelers
    @OneToMany(mappedBy = "travelPackage", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PackageApplication> applications = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum PackageStatus {
        ACTIVE,
        INACTIVE,
        DRAFT
    }
}
