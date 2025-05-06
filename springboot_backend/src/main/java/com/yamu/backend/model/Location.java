package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Location {
    @Id
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "day_plan_id", nullable = false)
    private DayPlan dayPlan;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(nullable = false)
    private double latitude;
    
    @Column(nullable = false)
    private double longitude;
    
    @Column(nullable = false)
    private int positionIndex;
    
    private String placeId;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}