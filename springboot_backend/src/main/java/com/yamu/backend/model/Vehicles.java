package com.yamu.backend.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
public class Vehicles {

    @Id   
    @Column(name = "vehicle_id") 

    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    @OneToOne(mappedBy = "vehicle" )
    private Long id;
    private String brand;
    private String model;
    private String type;
    @Column(name = "no_of_seats")
    private int capacity;
    private boolean airConditioned;
    private boolean available;
    @JoinColumn(name = "guide_id")
    private Long guide;
    


    
}
