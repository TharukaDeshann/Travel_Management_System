package com.yamu.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

// Entity representing a guide reservation
@Entity
@Table(name = "guide_reservations")
public class GuideReservation {

    // Enum for reservation types
    public enum ReservationType {
        TOUR, PERSONAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many-to-one relationship with the User entity (guide)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Date of the reservation
    @Column(nullable = false)
    private LocalDate date;

    // Type of the reservation (e.g., TOUR or PERSONAL)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationType type;

    // Name of the traveler
    @Column(name = "traveler_name")
    private String travelerName;

    // Place of the reservation
    private String place;

    // Time period of the reservation
    @Column(name = "time_period")
    private String timePeriod;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public ReservationType getType() {
        return type;
    }

    public void setType(ReservationType type) {
        this.type = type;
    }

    public String getTravelerName() {
        return travelerName;
    }

    public void setTravelerName(String travelerName) {
        this.travelerName = travelerName;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public String getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(String timePeriod) {
        this.timePeriod = timePeriod;
    }
}