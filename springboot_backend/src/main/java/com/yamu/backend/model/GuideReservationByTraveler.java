package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

// Entity representing a guide reservation made by a traveler
@Entity
@Table(name = "guide_reservation_by_traveler")
@Getter
@Setter
public class GuideReservationByTraveler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many-to-one relationship with the User entity (traveler)
    @ManyToOne
    @JoinColumn(name = "traveler_id", nullable = false)
    private User traveler;

    // Many-to-one relationship with the User entity (guide)
    @ManyToOne
    @JoinColumn(name = "guide_id", nullable = false)
    private User guide;

    // Number of days for the reservation
    @Column(nullable = false)
    private Integer numberOfDays;

    // Status of the reservation
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING;

    // One-to-many relationship with day details of the reservation
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GuideReservationDayDetail> dayDetails;

    // Timestamp for when the reservation was created
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Timestamp for when the reservation was last updated
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column
    private Double estimatedPrice;


    public enum ReservationStatus {
        PENDING, CONFIRMED, DECLINED, COMPLETED
    }
}