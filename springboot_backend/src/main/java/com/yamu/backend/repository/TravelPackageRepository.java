package com.yamu.backend.repository;

import com.yamu.backend.model.TravelPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelPackageRepository extends JpaRepository<TravelPackage, Long> {
    
    List<TravelPackage> findByStatusOrderByCreatedAtDesc(TravelPackage.PackageStatus status);
    
    List<TravelPackage> findAllByOrderByCreatedAtDesc();
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = :status AND p.durationDays <= :maxDays")
    List<TravelPackage> findByStatusAndDurationDaysLessThanEqual(
            @Param("status") TravelPackage.PackageStatus status, 
            @Param("maxDays") Integer maxDays);
    
    @Query("SELECT p FROM TravelPackage p WHERE p.status = :status AND p.budgetPerPerson <= :maxBudget")
    List<TravelPackage> findByStatusAndBudgetPerPersonLessThanEqual(
            @Param("status") TravelPackage.PackageStatus status, 
            @Param("maxBudget") java.math.BigDecimal maxBudget);
}
