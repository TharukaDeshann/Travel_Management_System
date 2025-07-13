package com.yamu.backend.repository;

import com.yamu.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverVehicleRepository extends JpaRepository<Vehicle, Long> {
}