package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "package_day_plan_routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageDayPlanRoute {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_day_plan_id", nullable = false, unique = true)
    private PackageDayPlan packageDayPlan;
    
    @Column(nullable = false)
    private String name; // Route name like "Day 1 Route"
    
    private String travelMode; // driving-car, cycling-regular, foot-walking, etc.
    
    private Double totalDistance; // in kilometers
    
    private Integer estimatedTime; // in minutes
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "packageDayPlanRoute", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackageDayPlanLocation> locations = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
