package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "package_day_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageDayPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private TravelPackage travelPackage;
    
    @Column(nullable = false)
    private Integer dayNumber;
    
    @Column(nullable = false, length = 200)
    private String dayTitle;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String plannedLocations; // JSON string of locations for the day
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String activities; // Activities planned for the day
    
    @Column(precision = 8, scale = 2)
    private BigDecimal estimatedCostPerPerson; // Cost for activities/meals for this day
    
    @Column(columnDefinition = "TEXT")
    private String transportationDetails; // Transportation for this specific day
    
    @Column(columnDefinition = "TEXT")
    private String mealPlans; // Breakfast, lunch, dinner arrangements
    
    @Column(columnDefinition = "TEXT")
    private String notes; // Additional notes for the day
}
