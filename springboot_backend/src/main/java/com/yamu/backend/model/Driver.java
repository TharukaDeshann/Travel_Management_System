package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private double rating;
    private int phone;
    private Double ratePerLng; // Rate per hour in cents

    @Lob
    private byte[] photo; // Blob for image

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id")
    private DriverVehicle vehicle;

    // Add other fields as needed (phone, license, etc.)

    // Getters and Setters

}