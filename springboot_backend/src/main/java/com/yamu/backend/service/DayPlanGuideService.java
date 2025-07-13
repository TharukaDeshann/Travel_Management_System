package com.yamu.backend.service;

import com.yamu.backend.model.DayPlan;
import com.yamu.backend.model.DayPlanGuide;
import com.yamu.backend.model.GuideReservationByTraveler;
import com.yamu.backend.model.GuideReservationDayDetail;
import com.yamu.backend.repository.DayPlanGuideRepository;
import com.yamu.backend.repository.DayPlanRepository;
import com.yamu.backend.repository.GuideReservationByTravelerRepository;
import com.yamu.backend.repository.GuideReservationDayDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class DayPlanGuideService {

    @Autowired
    private DayPlanGuideRepository dayPlanGuideRepository;

    @Autowired
    private DayPlanRepository dayPlanRepository;

    @Autowired
    private GuideReservationByTravelerRepository guideReservationByTravelerRepository;

    @Autowired
    private GuideReservationDayDetailRepository guideReservationDayDetailRepository;

    @Transactional
    public DayPlanGuide linkGuideReservationToDayPlan(Long dayPlanId, Long guideReservationId, Long guideReservationDayDetailId) {
        // Find the day plan
        DayPlan dayPlan = dayPlanRepository.findById(dayPlanId)
                .orElseThrow(() -> new RuntimeException("Day plan not found"));

        // Find the guide reservation
        GuideReservationByTraveler guideReservation = guideReservationByTravelerRepository.findById(guideReservationId)
                .orElseThrow(() -> new RuntimeException("Guide reservation not found"));

        // Find the guide reservation day detail
        GuideReservationDayDetail guideReservationDayDetail = guideReservationDayDetailRepository.findById(guideReservationDayDetailId)
                .orElseThrow(() -> new RuntimeException("Guide reservation day detail not found"));

        // Create the link
        DayPlanGuide dayPlanGuide = new DayPlanGuide();
        dayPlanGuide.setDayPlan(dayPlan);
        dayPlanGuide.setGuideReservationByTraveler(guideReservation);
        dayPlanGuide.setGuideReservationDayDetail(guideReservationDayDetail);

        return dayPlanGuideRepository.save(dayPlanGuide);
    }

    public Optional<DayPlanGuide> findByDayPlanId(Long dayPlanId) {
        return dayPlanGuideRepository.findByDayPlanId(dayPlanId);
    }
} 