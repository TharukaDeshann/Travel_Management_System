package com.yamu.backend.repository;

import com.yamu.backend.model.TravelPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<TravelPackage, Long> {
    
    List<TravelPackage> findByIsActiveTrue();
    
    List<TravelPackage> findByMainAttractionContainingIgnoreCase(String attraction);
    
    List<TravelPackage> findByCategory(TravelPackage.PackageCategory category);
    
    @Query("SELECT p FROM TravelPackage p WHERE p.totalBudget BETWEEN :minBudget AND :maxBudget AND p.isActive = true")
    List<TravelPackage> findByBudgetRange(@Param("minBudget") BigDecimal minBudget, @Param("maxBudget") BigDecimal maxBudget);
    
    @Query("SELECT p FROM TravelPackage p WHERE p.startDate >= :startDate AND p.endDate <= :endDate AND p.isActive = true")
    List<TravelPackage> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<TravelPackage> findByDurationDaysAndIsActiveTrue(Integer durationDays);
} 