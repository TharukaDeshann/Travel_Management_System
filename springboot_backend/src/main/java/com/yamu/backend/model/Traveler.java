package com.yamu.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "travelers")
@DiscriminatorValue("TRAVELER")
public class Traveler extends User {

    @Column(nullable = false, length = 50)
    private String nationality;

    // Getters and Setters
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
}
