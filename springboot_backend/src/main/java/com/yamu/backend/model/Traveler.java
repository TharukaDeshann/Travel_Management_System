package com.yamu.backend.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "travelers")
@DiscriminatorValue("TRAVELER")
@Getter
@Setter
public class Traveler extends User {

    @Column(nullable = false, length = 50)
    @NotNull(message = "Nationality is required")
    private String nationality;

    @OneToMany(mappedBy = "traveler", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Itinerary> itineraries = new ArrayList<>();
}
