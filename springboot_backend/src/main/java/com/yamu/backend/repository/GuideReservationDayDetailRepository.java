package com.yamu.backend.repository;

import com.yamu.backend.model.GuideReservationDayDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuideReservationDayDetailRepository extends JpaRepository<GuideReservationDayDetail, Long> {
    void deleteByReservationId(Long reservationId);
}