package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "day_plan_guide")
@Getter
@Setter
public class DayPlanGuide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_plan_id", nullable = false)
    private DayPlan dayPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guideid_daydetails")
    private GuideReservationDayDetail guideReservationDayDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guideid_from_traveler")
    private GuideReservationByTraveler guideReservationByTraveler;
} 