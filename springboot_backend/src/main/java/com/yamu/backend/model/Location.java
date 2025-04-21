package com.yamu.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Table(name = "locations")
@Entity(name = "location")
@Getter
@Setter
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private long id;
    
    @Column(name = "name", nullable = false)
    @NotBlank(message = "Name is required")
    private String name;
    
    @Column(name = "longitude", nullable = false)
    private double longitude;
    
    @Column(name = "latitude", nullable = false)
    private double latitude;
    
    // New fields
    @Column(name = "position_index")
    private int positionIndex;
    
    @Column(name = "route_id")
    private Long routeId;
    
    @Column(name = "place_id")
    private String placeId;
    
    @Column(name = "address", length = 500)
    private String address;
    
    @Column(name = "notes", length = 1000)
    private String notes;
}