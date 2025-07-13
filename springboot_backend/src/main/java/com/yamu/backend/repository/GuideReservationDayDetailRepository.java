package com.yamu.backend.repository;

import com.yamu.backend.model.GuideReservationDayDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuideReservationDayDetailRepository extends JpaRepository<GuideReservationDayDetail, Long> {
    List<GuideReservationDayDetail> findByReservationId(Long reservationId);
} 