package com.yamu.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yamu.backend.model.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByGuideId(Long guideId);
    Optional<Vehicle> findByIdAndGuideId(Long vehicleId, Long guideId);
    List<Vehicle> findByGuideIdAndAvailableTrue(Long guideId);
    Optional<Vehicle> findByIdAndAvailableTrue(Long vehicleId);
}
