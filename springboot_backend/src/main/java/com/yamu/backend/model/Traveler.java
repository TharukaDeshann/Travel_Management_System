package com.yamu.backend.model;

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

    
}
