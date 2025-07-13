package com.yamu.backend.controller;

import com.yamu.backend.dto.*;
import com.yamu.backend.dto.*;
import com.yamu.backend.model.*;
import com.yamu.backend.service.GuideReservationByTravelerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class GuideReservationByTravelerController {

    private final GuideReservationByTravelerService reservationService;

    // Constructor to inject the service dependency
    public GuideReservationByTravelerController(GuideReservationByTravelerService reservationService) {
        this.reservationService = reservationService;
    }

    // Converts a GuideReservationByTraveler entity to a DTO
    private GuideReservationResponse convertToDto(GuideReservationByTraveler reservation) {
        GuideReservationResponse dto = new GuideReservationResponse();
        dto.setId(reservation.getId());
        
        // Map traveler details if available
        if (reservation.getTraveler() != null) {
            dto.setTravelerId(reservation.getTraveler().getId());
            dto.setTraveler(UserDto.fromEntity(reservation.getTraveler()));
        }
        
        // Map guide details if available
        if (reservation.getGuide() != null) {
            dto.setGuideId(reservation.getGuide().getId());
            dto.setGuideName(reservation.getGuide().getFirstName() + " " + reservation.getGuide().getLastName());
            dto.setGuideContact(reservation.getGuide().getContactNumber());
        }
        
        // Map other reservation details
        dto.setNumberOfDays(reservation.getNumberOfDays());
        dto.setEstimatedPrice(reservation.getEstimatedPrice());
        dto.setEstimatedPrice(reservation.getEstimatedPrice());
        
        // Map reservation status if available
        if (reservation.getStatus() != null) {
            dto.setStatus(reservation.getStatus().name());
        }
        
        // Map creation and update timestamps if available
        if (reservation.getCreatedAt() != null) {
            dto.setCreatedAt(reservation.getCreatedAt().toString());
        }
        
        if (reservation.getUpdatedAt() != null) {
            dto.setUpdatedAt(reservation.getUpdatedAt().toString());
        }
        
        // Map day details if available
        if (reservation.getDayDetails() != null) {
            dto.setDayDetails(reservation.getDayDetails().stream()
                .map(this::convertDayDetailToDto)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }

    // Converts a GuideReservationDayDetail entity to a DTO
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

    // Endpoint to create a new reservation
    @PostMapping
    public ResponseEntity<GuideReservationResponse> createReservation(
            @RequestBody CreateReservationRequest request) {
        GuideReservationByTraveler reservation = reservationService.createReservation(request);
        return ResponseEntity.ok(convertToDto(reservation));
    }

    // Endpoint to get reservations for a specific guide
    @GetMapping("/guide/{guideId}")
    public ResponseEntity<List<GuideReservationResponse>> getGuideReservations(
            @PathVariable Long guideId) {
        List<GuideReservationByTraveler> reservations = reservationService.getReservationsForGuide(guideId);
        List<GuideReservationResponse> response = reservations.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Endpoint to get reservations for a specific traveler
    @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<List<GuideReservationResponse>> getTravelerReservations(
            @PathVariable Long travelerId) {
        List<GuideReservationByTraveler> reservations = reservationService.getReservationsForTraveler(travelerId);
        List<GuideReservationResponse> response = reservations.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Endpoint to confirm a reservation
    @PutMapping("/{reservationId}/confirm")
    public ResponseEntity<GuideReservationResponse> confirmReservation(
            @PathVariable Long reservationId) {
        GuideReservationByTraveler reservation = reservationService.updateReservationStatus(
            reservationId, 
            GuideReservationByTraveler.ReservationStatus.CONFIRMED);
        return ResponseEntity.ok(convertToDto(reservation));
    }

    // Endpoint to decline a reservation
    @PutMapping("/{reservationId}/decline")
    public ResponseEntity<GuideReservationResponse> declineReservation(
            @PathVariable Long reservationId) {
        GuideReservationByTraveler reservation = reservationService.updateReservationStatus(
            reservationId, 
            GuideReservationByTraveler.ReservationStatus.DECLINED);
        return ResponseEntity.ok(convertToDto(reservation));
    }

    // Endpoint to mark a reservation as completed
    @PutMapping("/{reservationId}/complete")
    public ResponseEntity<GuideReservationResponse> completeReservation(
            @PathVariable Long reservationId) {
        GuideReservationByTraveler reservation = reservationService.updateReservationStatus(
            reservationId, 
            GuideReservationByTraveler.ReservationStatus.COMPLETED);
        return ResponseEntity.ok(convertToDto(reservation));
    }

    // Endpoint to set the estimated price for a reservation
    @PutMapping("/{reservationId}/set-price")
    public ResponseEntity<GuideReservationResponse> setReservationPrice(
            @PathVariable Long reservationId,
            @RequestBody Map<String, Double> request) {
        GuideReservationByTraveler reservation = reservationService.setReservationPrice(
            reservationId, 
            request.get("estimatedPrice"));
        return ResponseEntity.ok(convertToDto(reservation));
    }
}