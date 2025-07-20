package com.yamu.backend.repository;

import com.yamu.backend.model.DayPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface DayPlanRepository extends JpaRepository<DayPlan, Long> {
    DayPlan findByItineraryIdAndDate(Long itineraryId, Date date);
}