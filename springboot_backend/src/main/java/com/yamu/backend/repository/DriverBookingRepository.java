package com.yamu.backend.repository;

import com.yamu.backend.model.DriverBooking;
import com.yamu.backend.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DriverBookingRepository extends JpaRepository<DriverBooking, Long> {
    List<DriverBooking> findByBookingDateAndStatus(LocalDate date, String status);
    List<DriverBooking> findByDriverAndBookingDateAndStatus(Driver driver, LocalDate date, String status);
}