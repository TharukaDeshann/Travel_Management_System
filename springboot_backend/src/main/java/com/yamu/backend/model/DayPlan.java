package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "day_plan")
@Getter
@Setter
public class DayPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date date;

    @Column(columnDefinition = "TEXT")
    private String hotelDetails;

    @Column(columnDefinition = "TEXT")
    private String transportDetails;

    @Column(columnDefinition = "TEXT")
    private String guideDetails;

    @OneToMany(mappedBy = "dayPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Location> locations = new ArrayList<>();

    @OneToOne(mappedBy = "dayPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Route route;

    // Add new relationship
    @ManyToOne
    @JoinColumn(name = "guide_reservation_id")
    private GuideReservationByTraveler guideReservation;

    // Add getter and setter
    public GuideReservationByTraveler getGuideReservation() {
        return guideReservation;
    }

        public void setGuideReservation(GuideReservationByTraveler guideReservation) {
            this.guideReservation = guideReservation;
        }
    }