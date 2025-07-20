package com.yamu.backend.service;

import com.yamu.backend.dto.CreateReservationRequest;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.*;
import com.yamu.backend.repository.GuideReservationByTravelerRepository;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.repository.DayPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

// Service class for managing guide reservations made by travelers
@Service
public class GuideReservationByTravelerService {

    private final GuideReservationByTravelerRepository reservationRepository;
    private final UserRepository userRepository;

    @Autowired
    private DayPlanRepository dayPlanRepository;

    // Constructor to inject dependencies
    public GuideReservationByTravelerService(
            GuideReservationByTravelerRepository reservationRepository,
            UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    // Create a new reservation
    @Transactional
    public GuideReservationByTraveler createReservation(CreateReservationRequest request) {
        User traveler = userRepository.findById(request.getTravelerId())
                .orElseThrow(() -> new RuntimeException("Traveler not found"));
        
        if (traveler.getRole() != UserRole.TRAVELER) {
            throw new RuntimeException("Only travelers can make reservations");
        }

        User guide = userRepository.findById(request.getGuideId())
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        boolean hasVehicleRequest = request.getDayDetails().stream()
                .anyMatch(CreateReservationRequest.DayDetail::isVehicleRequested);
        
        if (hasVehicleRequest && !((Guide) guide).isVehicleAvailability()) {
            throw new RuntimeException("This guide doesn't have vehicle availability");
        }

        GuideReservationByTraveler reservation = new GuideReservationByTraveler();
        reservation.setTraveler(traveler);
        reservation.setGuide(guide);
        reservation.setNumberOfDays(request.getDayDetails().size());
        reservation.setStatus(GuideReservationByTraveler.ReservationStatus.PENDING);

        if (request.getDayPlanId() != null) {
            DayPlan dayPlan = dayPlanRepository.findById(request.getDayPlanId())
                .orElseThrow(() -> new RuntimeException("DayPlan not found"));
            reservation.setDayPlan(dayPlan);
        }

        List<GuideReservationDayDetail> dayDetails = request.getDayDetails().stream()
                .map(detail -> {
                    GuideReservationDayDetail dayDetail = new GuideReservationDayDetail();
                    dayDetail.setReservation(reservation);
                    dayDetail.setDayNumber(detail.getDayNumber());
                    dayDetail.setPlaces(detail.getPlaces());
                    dayDetail.setDate(LocalDate.parse(detail.getDate()));
                    dayDetail.setNumberOfTravelers(detail.getNumberOfTravelers());
                    dayDetail.setVehicleRequested(detail.isVehicleRequested());
                    dayDetail.setVehicleDetails(detail.getVehicleDetails());
                    return dayDetail;
                })
                .collect(Collectors.toList());

        reservation.setDayDetails(dayDetails);
        return reservationRepository.save(reservation);
    }

    // Retrieve reservations for a specific guide
    public List<GuideReservationByTraveler> getReservationsForGuide(Long guideId) {
        return reservationRepository.findByGuideId(guideId);
    }

    // Retrieve reservations for a specific traveler
    public List<GuideReservationByTraveler> getReservationsForTraveler(Long travelerId) {
        return reservationRepository.findByTravelerId(travelerId);
    }

    // Update the status of a reservation
    @Transactional
    public GuideReservationByTraveler updateReservationStatus(Long reservationId, 
            GuideReservationByTraveler.ReservationStatus status) {
        GuideReservationByTraveler reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        reservation.setStatus(status);
        reservation.setUpdatedAt(LocalDateTime.now());
        return reservationRepository.save(reservation);
    }

    // Set the estimated price for a reservation
    @Transactional
    public GuideReservationByTraveler setReservationPrice(Long reservationId, Double estimatedPrice) {
        GuideReservationByTraveler reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        reservation.setEstimatedPrice(estimatedPrice);
        reservation.setUpdatedAt(LocalDateTime.now());
        return reservationRepository.save(reservation);
    }

    public Optional<GuideReservationByTraveler> getByDayPlanId(Long dayPlanId) {
        return reservationRepository.findByDayPlanId(dayPlanId);
    }
}