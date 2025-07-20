package com.yamu.backend.service;

import com.yamu.backend.dto.CreateReservationRequest;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.model.*;
import com.yamu.backend.repository.GuideReservationByTravelerRepository;
import com.yamu.backend.repository.GuideReservationDayDetailRepository;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GuideReservationByTravelerService {

    private final GuideReservationByTravelerRepository reservationRepository;
    private final GuideReservationDayDetailRepository dayDetailRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public GuideReservationByTravelerService(
            GuideReservationByTravelerRepository reservationRepository,
            GuideReservationDayDetailRepository dayDetailRepository,
            UserRepository userRepository,
            VehicleRepository vehicleRepository) {
        this.reservationRepository = reservationRepository;
        this.dayDetailRepository = dayDetailRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public GuideReservationByTraveler createReservation(CreateReservationRequest request) {
        User traveler = userRepository.findById(request.getTravelerId())
                .orElseThrow(() -> new RuntimeException("Traveler not found"));
        
        if (traveler.getRole() != UserRole.TRAVELER) {
            throw new RuntimeException("Only travelers can make reservations");
        }

        User guide = userRepository.findById(request.getGuideId())
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        // Check vehicle availability for each day that requests a vehicle
        for (CreateReservationRequest.DayDetail dayDetail : request.getDayDetails()) {
            if (dayDetail.isVehicleRequested() && dayDetail.getVehicleId() != null) {
                Vehicle vehicle = vehicleRepository.findById(dayDetail.getVehicleId())
                        .orElseThrow(() -> new RuntimeException("Vehicle not found"));
                
                if (!vehicle.isAvailable() || !vehicle.getGuide().getId().equals(guide.getId())) {
                    throw new RuntimeException("Selected vehicle is not available or doesn't belong to this guide");
                }
            }
        }

        GuideReservationByTraveler reservation = new GuideReservationByTraveler();
        reservation.setTraveler(traveler);
        reservation.setGuide(guide);
        reservation.setNumberOfDays(request.getDayDetails().size());
        reservation.setStatus(GuideReservationByTraveler.ReservationStatus.PENDING);

        List<GuideReservationDayDetail> dayDetails = request.getDayDetails().stream()
                .map(detail -> {
                    GuideReservationDayDetail dayDetail = new GuideReservationDayDetail();
                    dayDetail.setReservation(reservation);
                    dayDetail.setDayNumber(detail.getDayNumber());
                    dayDetail.setPlaces(detail.getPlaces());
                    dayDetail.setDate(LocalDate.parse(detail.getDate()));
                    dayDetail.setNumberOfTravelers(detail.getNumberOfTravelers());
                    dayDetail.setVehicleRequested(detail.isVehicleRequested());
                    
                    if (detail.isVehicleRequested() && detail.getVehicleId() != null) {
                        Vehicle vehicle = vehicleRepository.findById(detail.getVehicleId())
                                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
                        dayDetail.setSelectedVehicle(vehicle);
                    }
                    
                    dayDetail.setVehicleDetails(detail.getVehicleDetails());
                    return dayDetail;
                })
                .collect(Collectors.toList());

        reservation.setDayDetails(dayDetails);
        return reservationRepository.save(reservation);
    }

    @Transactional
    public GuideReservationByTraveler updateReservation(Long reservationId, CreateReservationRequest request) {
        GuideReservationByTraveler reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        // Validate reservation can be edited (only PENDING status)
        if (reservation.getStatus() != GuideReservationByTraveler.ReservationStatus.PENDING) {
            throw new IllegalStateException("Only PENDING reservations can be modified");
        }
        
        // Validate the guide hasn't changed
        if (!reservation.getGuide().getId().equals(request.getGuideId())) {
            throw new IllegalStateException("Cannot change the guide for an existing reservation");
        }

        // Clear existing day details
        dayDetailRepository.deleteByReservationId(reservationId);
        reservationRepository.flush();

        // Update basic info
        reservation.setNumberOfDays(request.getDayDetails().size());
        reservation.setUpdatedAt(LocalDateTime.now());
        
        // Add new day details
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

    public List<GuideReservationByTraveler> getReservationsForGuide(Long guideId) {
        return reservationRepository.findByGuideId(guideId);
    }

    public List<GuideReservationByTraveler> getReservationsForTraveler(Long travelerId) {
        return reservationRepository.findByTravelerId(travelerId);
    }

    @Transactional
    public GuideReservationByTraveler updateReservationStatus(Long reservationId, 
            GuideReservationByTraveler.ReservationStatus status) {
        GuideReservationByTraveler reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        reservation.setStatus(status);
        reservation.setUpdatedAt(LocalDateTime.now());
        return reservationRepository.save(reservation);
    }

    @Transactional
    public GuideReservationByTraveler setReservationPrice(Long reservationId, Double estimatedPrice) {
        GuideReservationByTraveler reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        reservation.setEstimatedPrice(estimatedPrice);
        reservation.setUpdatedAt(LocalDateTime.now());
        return reservationRepository.save(reservation);
    }

    public GuideReservationByTraveler getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
    }

    @Transactional
    public void deleteReservation(Long reservationId) {
        if (!reservationRepository.existsById(reservationId)) {
            throw new ResourceNotFoundException("Reservation not found");
        }
        reservationRepository.deleteById(reservationId);
    }
}