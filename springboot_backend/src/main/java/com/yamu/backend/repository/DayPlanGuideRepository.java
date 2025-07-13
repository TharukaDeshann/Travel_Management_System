package com.yamu.backend.repository;

import com.yamu.backend.model.DayPlanGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DayPlanGuideRepository extends JpaRepository<DayPlanGuide, Long> {
    Optional<DayPlanGuide> findByDayPlanId(Long dayPlanId);
} 