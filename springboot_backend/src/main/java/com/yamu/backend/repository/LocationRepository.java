package com.yamu.backend.repository;

import com.yamu.backend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByDayPlanId(String dayPlanId);
}