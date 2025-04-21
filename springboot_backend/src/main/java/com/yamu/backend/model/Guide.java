package com.yamu.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "guides")
@DiscriminatorValue("GUIDE")
@Getter
@Setter
public class Guide extends User {

    @Column(nullable = false, length = 100)
    @NotNull(message = "Expertise City Region is required")
    private String expertiseCityRegion;

    @Column(nullable = false, length = 100)
    @NotNull(message = "Language is required")
    private String language;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Column(nullable = false)
    @NotNull(message = "Vehicle Availability is required")
    private boolean vehicleAvailability;
}