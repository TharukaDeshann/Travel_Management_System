package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "guide_reservation_day_details")
@Getter
@Setter
public class GuideReservationDayDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reservation_id", nullable = false)
    private GuideReservationByTraveler reservation;

    @Column(nullable = false)
    private Integer dayNumber;

    @Column(nullable = false, length = 500)
    private String places;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer numberOfTravelers;

    @Column
    private Boolean vehicleRequested = false;

    @Column(length = 500)
    private String vehicleDetails;
}