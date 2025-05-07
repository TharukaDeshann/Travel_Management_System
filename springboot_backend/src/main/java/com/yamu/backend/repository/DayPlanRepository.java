package com.yamu.backend.repository;

import com.yamu.backend.model.DayPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DayPlanRepository extends JpaRepository<DayPlan, String> {
}