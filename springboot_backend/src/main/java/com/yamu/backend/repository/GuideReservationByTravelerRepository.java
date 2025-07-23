package com.yamu.backend.repository;

import com.yamu.backend.model.GuideReservationByTraveler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface GuideReservationByTravelerRepository extends JpaRepository<GuideReservationByTraveler, Long> {

    // Find reservations by guide ID
    List<GuideReservationByTraveler> findByGuideId(Long guideId);

    // Find reservations by traveler ID
    List<GuideReservationByTraveler> findByTravelerId(Long travelerId);

    // Find reservation by day plan ID
    Optional<GuideReservationByTraveler> findByDayPlanId(Long dayPlanId);

    // Check if a completed reservation exists for a traveler and guide
    @Query("SELECT COUNT(r) > 0 FROM GuideReservationByTraveler r WHERE r.traveler.id = :travelerId AND r.guide.id = :guideId AND r.status = 'COMPLETED'")
    boolean existsCompletedReservationByTravelerAndGuide(@Param("travelerId") Long travelerId, @Param("guideId") Long guideId);
}