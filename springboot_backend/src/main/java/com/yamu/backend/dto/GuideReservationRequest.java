package com.yamu.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.yamu.backend.model.GuideReservation;
import java.time.LocalDate;

// DTO for creating a guide reservation request
public class GuideReservationRequest {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;
    private GuideReservation.ReservationType type;
    private String travelerName;
    private String place;
    private String timePeriod;

    // Getters and Setters
    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public GuideReservation.ReservationType getType() {
        return type;
    }

    public void setType(GuideReservation.ReservationType type) {
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