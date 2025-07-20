package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

// Entity representing details of a single day in a guide reservation
@Entity
@Table(name = "guide_reservation_day_details")
@Getter
@Setter
public class GuideReservationDayDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many-to-one relationship with the GuideReservationByTraveler entity
    @ManyToOne
    @JoinColumn(name = "reservation_id", nullable = false)
    private GuideReservationByTraveler reservation;

    // Day number in the reservation
    @Column(nullable = false)
    private Integer dayNumber;

    // Places to visit on this day
    @Column(nullable = false, length = 500)
    private String places;

    // Date of this day in the reservation
    @Column(nullable = false)
    private LocalDate date;

    // Number of travelers for this day
    @Column(nullable = false)
    private Integer numberOfTravelers;

    // Whether a vehicle is requested for this day
    @Column
    private Boolean vehicleRequested = false;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle selectedVehicle;

    // Details of the vehicle requested
    @Column(length = 500)
    private String vehicleDetails;
}