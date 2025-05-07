package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "guide_reservation_by_traveler")
@Getter
@Setter
public class GuideReservationByTraveler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "traveler_id", nullable = false)
    private User traveler;

    @ManyToOne
    @JoinColumn(name = "guide_id", nullable = false)
    private User guide;

    @Column(nullable = false)
    private Integer numberOfDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GuideReservationDayDetail> dayDetails;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ReservationStatus {
        PENDING, CONFIRMED, DECLINED
    }
}