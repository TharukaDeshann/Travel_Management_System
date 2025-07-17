package com.yamu.backend.repository;

import com.yamu.backend.model.PackageAttraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageAttractionRepository extends JpaRepository<PackageAttraction, Long> {
    
    List<PackageAttraction> findByTravelPackageIdOrderByVisitOrder(Long packageId);
    
    List<PackageAttraction> findByTravelPackageIdAndIsMainAttractionTrue(Long packageId);
} 