package com.yamu.backend.repository;

import com.yamu.backend.model.GuideReservationByTraveler;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Repository interface for managing GuideReservationByTraveler entities
public interface GuideReservationByTravelerRepository extends JpaRepository<GuideReservationByTraveler, Long> {

    // Find reservations by guide ID
    List<GuideReservationByTraveler> findByGuideId(Long guideId);

    // Find reservations by traveler ID
    List<GuideReservationByTraveler> findByTravelerId(Long travelerId);
}