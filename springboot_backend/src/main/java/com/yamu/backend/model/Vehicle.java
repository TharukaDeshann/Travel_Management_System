package com.yamu.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id", nullable = false)
    @NotNull(message = "Guide is required")
    private Guide guide;

    @Column(nullable = false, length = 50)
    @NotNull(message = "Model is required")
    private String model;

    @Column(nullable = false, length = 30)
    @NotNull(message = "Type is required")
    private String type;

    @Column(nullable = false)
    @NotNull(message = "Capacity is required")
    private int capacity;

    @Column(nullable = false)
    @NotNull(message = "Air conditioning status is required")
    private boolean airConditioned;

    @Column(nullable = false)
    @NotNull(message = "Availability status is required")
    private boolean available;

    private String vehicleImageUrl; 

    
}
