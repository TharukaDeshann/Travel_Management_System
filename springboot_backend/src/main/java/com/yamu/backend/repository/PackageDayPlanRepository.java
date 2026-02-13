package com.yamu.backend.repository;

import com.yamu.backend.model.PackageDayPlan;
import com.yamu.backend.model.TravelPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageDayPlanRepository extends JpaRepository<PackageDayPlan, Long> {
    
    List<PackageDayPlan> findByTravelPackageOrderByDayNumber(TravelPackage travelPackage);
    
    List<PackageDayPlan> findByTravelPackageIdOrderByDayNumber(Long packageId);
}
