package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Entity
@Getter
@Setter
public class Itinerary {
    @Id
    private String id; // UUID for unique identification

    @Column(nullable = false)
    private double budget;

    @Column(nullable = false, length = 3)
    private String currency;

    @Temporal(TemporalType.DATE)
    @Column(name = "start_date", nullable = false)
    private Date startDate;

    @Temporal(TemporalType.DATE)
    @Column(name = "end_date", nullable = false)
    private Date endDate;

    @Column(name = "trip_title", nullable = false)
    private String tripTitle;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Foreign key relationship with the User table
}