package com.yamu.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "guides")
@DiscriminatorValue("GUIDE")
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

    // Getters and Setters
    public String getExpertiseCityRegion() { return expertiseCityRegion; }
    public void setExpertiseCityRegion(String expertiseCityRegion) { this.expertiseCityRegion = expertiseCityRegion; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public boolean isVehicleAvailability() { return vehicleAvailability; }
    public void setVehicleAvailability(boolean vehicleAvailability) { this.vehicleAvailability = vehicleAvailability; }
}
