package com.yamu.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Table(name = "locations")
@Entity(name = "location")
@Getter
@Setter
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Add this line to auto-generate IDs
    @Column(name = "id", nullable = false)
    private long id;
    
    @Column(name = "name", nullable = false)
    @NotBlank(message = "Name is required")
    private String name;
    
    @Column(name = "longitude", nullable = false)
    private double longitude;
    
    @Column(name = "latitude", nullable = false)
    private double latitude;
}