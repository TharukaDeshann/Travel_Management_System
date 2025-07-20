package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "package_day_plan_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageDayPlanLocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_day_plan_id", nullable = false)
    private PackageDayPlan packageDayPlan;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_day_plan_route_id")
    private PackageDayPlanRoute packageDayPlanRoute;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(nullable = false)
    private double latitude;
    
    @Column(nullable = false)
    private double longitude;
    
    @Column(nullable = false)
    private int positionIndex; // Order of location in the route
    
    private String placeId; // Google Places ID for reference
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}
