package com.yamu.backend.repository;

import com.yamu.backend.model.GuideReservationByTraveler;
import com.yamu.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuideReservationByTravelerRepository extends JpaRepository<GuideReservationByTraveler, Long> {
    List<GuideReservationByTraveler> findByGuideId(Long guideId);
    List<GuideReservationByTraveler> findByTravelerId(Long travelerId);
}