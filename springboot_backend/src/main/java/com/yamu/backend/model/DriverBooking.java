package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Driver driver;

    private LocalDate bookingDate;

    private Long travelerId; // Traveler/user who booked

    private String status; // BOOKED, CANCELLED

    // Start Location
    private String startLocationName;
    private Double startLocationLat;
    private Double startLocationLon;

    // End Location
    private String endLocationName;
    private Double endLocationLat;
    private Double endLocationLon;

    private Double travelCost;    // Total cost for this booking
    private Double travelLength;  // Total distance in KM

    @ManyToOne
    @JoinColumn(name = "day_plan_id")
    private DayPlan dayPlan;

    // Getters and Setters (if not using Lombok)
}