package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter @Setter
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

    @Column(columnDefinition = "JSON")
    private String hotelDetails;

    @Column(columnDefinition = "JSON")
    private String transportDetails;

    @Column(columnDefinition = "JSON")
    private String guideDetails;

    @OneToMany(mappedBy = "dayPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Location> locations = new ArrayList<>();

    @OneToOne(mappedBy = "dayPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private Route route;
}
