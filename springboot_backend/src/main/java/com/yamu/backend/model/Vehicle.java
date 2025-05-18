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
    private Guide guide;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(nullable = false, length = 30)
    @NotBlank(message = "Vehicle type is required")
    private String type;

    @Column(nullable = false)
    @NotBlank(message = "Capacity is required")
    private int capacity;

    @Column(nullable = false)
    @NotBlank(message = "Air conditioning status is required")
    private boolean airConditioned;

    @Column(nullable = false)
    @NotBlank(message = "Availability status is required")
    private boolean available;

    private String imageUrl; 

    
}
