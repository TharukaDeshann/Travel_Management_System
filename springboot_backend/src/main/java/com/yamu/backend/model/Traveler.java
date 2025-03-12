package com.yamu.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "travelers")
@DiscriminatorValue("TRAVELER")
public class Traveler extends User {

    @Column(nullable = false, length = 50)
    @NotNull(message = "Nationality is required")
    private String nationality;

    // Getters and Setters
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
}
