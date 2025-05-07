package com.yamu.backend.repository;

import com.yamu.backend.model.GuideReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GuideReservationRepository extends JpaRepository<GuideReservation, Long> {
    List<GuideReservation> findByUserId(Long userId);
    List<GuideReservation> findByUserIdAndDate(Long userId, LocalDate date);
    boolean existsByUserIdAndDate(Long userId, LocalDate date);
    boolean existsByIdAndUserId(Long id, Long userId);
}