package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter @Setter
public class Itinerary {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String tripTitle;
    
    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date startDate;
    
    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date endDate;
    
    @Column(nullable = false)
    private double budget;
    
    @Column(nullable = false, length = 3)
    private String currency;
    
    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DayPlan> dayPlans = new ArrayList<>();
}