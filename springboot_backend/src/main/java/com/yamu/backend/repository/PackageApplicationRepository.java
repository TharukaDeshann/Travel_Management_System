package com.yamu.backend.repository;

import com.yamu.backend.model.PackageApplication;
import com.yamu.backend.model.TravelPackage;
import com.yamu.backend.model.Traveler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageApplicationRepository extends JpaRepository<PackageApplication, Long> {
    
    List<PackageApplication> findByTravelerOrderByAppliedAtDesc(Traveler traveler);
    
    List<PackageApplication> findByTravelerIdOrderByAppliedAtDesc(Long travelerId);
    
    List<PackageApplication> findByTravelPackageOrderByAppliedAtDesc(TravelPackage travelPackage);
    
    List<PackageApplication> findByStatusOrderByAppliedAtDesc(PackageApplication.ApplicationStatus status);
    
    @Query("SELECT pa FROM PackageApplication pa WHERE pa.traveler.id = :travelerId AND pa.travelPackage.id = :packageId")
    Optional<PackageApplication> findByTravelerIdAndPackageId(
            @Param("travelerId") Long travelerId, 
            @Param("packageId") Long packageId);
    
    @Query("SELECT COUNT(pa) FROM PackageApplication pa WHERE pa.travelPackage.id = :packageId AND pa.status = :status")
    Long countByPackageIdAndStatus(
            @Param("packageId") Long packageId, 
            @Param("status") PackageApplication.ApplicationStatus status);
}
