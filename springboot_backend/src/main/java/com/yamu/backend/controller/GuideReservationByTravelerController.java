package com.yamu.backend.controller;

import com.yamu.backend.dto.CreateReservationRequest;
import com.yamu.backend.dto.GuideReservationResponse;
import com.yamu.backend.dto.UserDto;
import com.yamu.backend.model.*;
import com.yamu.backend.service.GuideReservationByTravelerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class GuideReservationByTravelerController {

    private final GuideReservationByTravelerService reservationService;

    public GuideReservationByTravelerController(GuideReservationByTravelerService reservationService) {
        this.reservationService = reservationService;
    }

    private GuideReservationResponse convertToDto(GuideReservationByTraveler reservation) {
        GuideReservationResponse dto = new GuideReservationResponse();
        dto.setId(reservation.getId());
        
        if (reservation.getTraveler() != null) {
            dto.setTravelerId(reservation.getTraveler().getId());
            dto.setTraveler(UserDto.fromEntity(reservation.getTraveler()));
        }
        
        if (reservation.getGuide() != null) {
            dto.setGuideId(reservation.getGuide().getId());
            // Add guide name and contact
            dto.setGuideName(reservation.getGuide().getFirstName() + " " + reservation.getGuide().getLastName());
            dto.setGuideContact(reservation.getGuide().getContactNumber());
        }
        
        dto.setNumberOfDays(reservation.getNumberOfDays());
        
        if (reservation.getStatus() != null) {
            dto.setStatus(reservation.getStatus().name());
        }
        
        if (reservation.getCreatedAt() != null) {
            dto.setCreatedAt(reservation.getCreatedAt().toString());
        }
        
        if (reservation.getUpdatedAt() != null) {
            dto.setUpdatedAt(reservation.getUpdatedAt().toString());
        }
        
        if (reservation.getDayDetails() != null) {
            dto.setDayDetails(reservation.getDayDetails().stream()
                .map(this::convertDayDetailToDto)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private GuideReservationResponse.DayDetailDto convertDayDetailToDto(GuideReservationDayDetail dayDetail) {
        GuideReservationResponse.DayDetailDto dayDetailDto = new GuideReservationResponse.DayDetailDto();
        dayDetailDto.setDayNumber(dayDetail.getDayNumber());
        dayDetailDto.setPlaces(dayDetail.getPlaces());
        dayDetailDto.setDate(dayDetail.getDate().toString());
        dayDetailDto.setNumberOfTravelers(dayDetail.getNumberOfTravelers());
        dayDetailDto.setVehicleRequested(dayDetail.getVehicleRequested());
        dayDetailDto.setVehicleDetails(dayDetail.getVehicleDetails());
        return dayDetailDto;
    }

    @PostMapping
    public ResponseEntity<GuideReservationResponse> createReservation(
            @RequestBody CreateReservationRequest request) {
        GuideReservationByTraveler reservation = reservationService.createReservation(request);
        return ResponseEntity.ok(convertToDto(reservation));
    }

    @GetMapping("/guide/{guideId}")
    public ResponseEntity<List<GuideReservationResponse>> getGuideReservations(
            @PathVariable Long guideId) {
        List<GuideReservationByTraveler> reservations = reservationService.getReservationsForGuide(guideId);
        List<GuideReservationResponse> response = reservations.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<List<GuideReservationResponse>> getTravelerReservations(
            @PathVariable Long travelerId) {
        List<GuideReservationByTraveler> reservations = reservationService.getReservationsForTraveler(travelerId);
        List<GuideReservationResponse> response = reservations.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reservationId}/confirm")
    public ResponseEntity<GuideReservationResponse> confirmReservation(
            @PathVariable Long reservationId) {
        GuideReservationByTraveler reservation = reservationService.updateReservationStatus(
            reservationId, 
            GuideReservationByTraveler.ReservationStatus.CONFIRMED);
        return ResponseEntity.ok(convertToDto(reservation));
    }

    @PutMapping("/{reservationId}/decline")
    public ResponseEntity<GuideReservationResponse> declineReservation(
            @PathVariable Long reservationId) {
        GuideReservationByTraveler reservation = reservationService.updateReservationStatus(
            reservationId, 
            GuideReservationByTraveler.ReservationStatus.DECLINED);
        return ResponseEntity.ok(convertToDto(reservation));
    }

    @PutMapping("/{reservationId}/complete")
    public ResponseEntity<GuideReservationResponse> completeReservation(
            @PathVariable Long reservationId) {
        GuideReservationByTraveler reservation = reservationService.updateReservationStatus(
            reservationId, 
            GuideReservationByTraveler.ReservationStatus.COMPLETED);
        return ResponseEntity.ok(convertToDto(reservation));
    }
}