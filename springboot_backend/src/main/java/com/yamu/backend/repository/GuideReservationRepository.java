package com.yamu.backend.repository;

import com.yamu.backend.model.GuideReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

// Repository interface for managing GuideReservation entities
@Repository
public interface GuideReservationRepository extends JpaRepository<GuideReservation, Long> {

    // Find reservations by user ID
    List<GuideReservation> findByUserId(Long userId);

    // Find reservations by user ID and date
    List<GuideReservation> findByUserIdAndDate(Long userId, LocalDate date);

    // Check if a reservation exists for a user on a specific date
    boolean existsByUserIdAndDate(Long userId, LocalDate date);

    // Check if a reservation exists by ID and user ID
    boolean existsByIdAndUserId(Long id, Long userId);
}