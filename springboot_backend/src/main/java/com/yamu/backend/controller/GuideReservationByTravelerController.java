package com.yamu.backend.controller;

import com.yamu.backend.dto.*;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.errorresponses.ErrorResponse;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.errorresponses.ErrorResponse;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.model.*;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.GuideReservationByTravelerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
@Slf4j
@Slf4j
public class GuideReservationByTravelerController {

    private final GuideReservationByTravelerService reservationService;
    private final UserRepository userRepository;
    private final UserRepository userRepository;

    public GuideReservationByTravelerController(
            GuideReservationByTravelerService reservationService,
            UserRepository userRepository) {
    public GuideReservationByTravelerController(
            GuideReservationByTravelerService reservationService,
            UserRepository userRepository) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestBody CreateReservationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!currentUser.getId().equals(request.getTravelerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Authorization Error", 
                              "You can only create reservations for yourself"));
            }
            
            GuideReservationByTraveler reservation = reservationService.createReservation(request);
            return ResponseEntity.ok(convertToDto(reservation));
        } catch (Exception ex) {
            log.error("Error creating reservation", ex);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Validation Error", ex.getMessage()));
        }
    }

    @PutMapping("/{reservationId}")
    @PreAuthorize("hasAnyRole('TRAVELER', 'GUIDE')")
    public ResponseEntity<?> updateReservation(
            @PathVariable Long reservationId,
            @RequestBody CreateReservationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            GuideReservationByTraveler reservation = reservationService.getReservationById(reservationId);
            
            if (!reservation.getTraveler().getEmail().equals(userDetails.getUsername()) 
                    && !reservation.getGuide().getEmail().equals(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Authorization Error",
                              "You don't have permission to modify this reservation"));
            }
            
            GuideReservationByTraveler updatedReservation = reservationService.updateReservation(reservationId, request);
            return ResponseEntity.ok(convertToDto(updatedReservation));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Validation Error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error updating reservation ID: " + reservationId, ex);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Server Error", 
                          "Failed to update reservation: " + ex.getMessage()));
        }
    }

    @GetMapping("/guide/{guideId}")
    public ResponseEntity<?> getGuideReservations(
            @PathVariable Long guideId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!currentUser.getId().equals(guideId) && !currentUser.getRole().equals(UserRole.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Authorization Error",
                              "You can only view your own reservations"));
            }
            
            List<GuideReservationByTraveler> reservations = reservationService.getReservationsForGuide(guideId);
            List<GuideReservationResponse> response = reservations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting reservations for guide ID: " + guideId, ex);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Server Error",
                          "Failed to get reservations: " + ex.getMessage()));
        }
    }

    @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<?> getTravelerReservations(
            @PathVariable Long travelerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!currentUser.getId().equals(travelerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Authorization Error",
                              "You can only view your own reservations"));
            }
            
            List<GuideReservationByTraveler> reservations = reservationService.getReservationsForTraveler(travelerId);
            List<GuideReservationResponse> response = reservations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting reservations for traveler ID: " + travelerId, ex);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Server Error",
                          "Failed to get reservations: " + ex.getMessage()));
        }
    }

    @PutMapping("/{reservationId}/confirm")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> confirmReservation(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            GuideReservationByTraveler reservation = reservationService.getReservationById(reservationId);
            
            if (!reservation.getGuide().getEmail().equals(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Authorization Error",
                              "You can only confirm your own reservations"));
            }
            
            GuideReservationByTraveler updatedReservation = reservationService.updateReservationStatus(
                reservationId, 
                GuideReservationByTraveler.ReservationStatus.CONFIRMED);
            return ResponseEntity.ok(convertToDto(updatedReservation));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            log.error("Error confirming reservation ID: " + reservationId, ex);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Server Error",
                          "Failed to confirm reservation: " + ex.getMessage()));
        }
    }

    @DeleteMapping("/{reservationId}")
    @PreAuthorize("hasAnyRole('TRAVELER', 'GUIDE')")
    public ResponseEntity<?> deleteReservation(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            GuideReservationByTraveler reservation = reservationService.getReservationById(reservationId);
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!reservation.getTraveler().getEmail().equals(userDetails.getUsername()) 
                    && !reservation.getGuide().getEmail().equals(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Authorization Error",
                              "You don't have permission to delete this reservation"));
            }
            
            reservationService.deleteReservation(reservationId);
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            log.error("Error deleting reservation ID: " + reservationId, ex);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Server Error",
                          "Failed to delete reservation: " + ex.getMessage()));
        }
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
            dto.setGuideName(reservation.getGuide().getFirstName() + " " + reservation.getGuide().getLastName());
            dto.setGuideContact(reservation.getGuide().getContactNumber());
        }
        
        dto.setNumberOfDays(reservation.getNumberOfDays());
        dto.setEstimatedPrice(reservation.getEstimatedPrice());
        dto.setStatus(reservation.getStatus().name());
        dto.setCreatedAt(reservation.getCreatedAt().toString());
        dto.setUpdatedAt(reservation.getUpdatedAt() != null ? reservation.getUpdatedAt().toString() : null);
        
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
        
        if (dayDetail.getSelectedVehicle() != null) {
            VehicleResponseDTO vehicleDto = new VehicleResponseDTO();
            vehicleDto.setId(dayDetail.getSelectedVehicle().getId());
            vehicleDto.setGuideId(dayDetail.getSelectedVehicle().getGuide().getId());
            vehicleDto.setType(dayDetail.getSelectedVehicle().getType());
            vehicleDto.setModel(dayDetail.getSelectedVehicle().getModel());
            vehicleDto.setCapacity(dayDetail.getSelectedVehicle().getCapacity());
            vehicleDto.setAirConditioned(dayDetail.getSelectedVehicle().isAirConditioned());
            vehicleDto.setAvailable(dayDetail.getSelectedVehicle().isAvailable());
            vehicleDto.setVehicleImageUrl(dayDetail.getSelectedVehicle().getVehicleImageUrl());
            dayDetailDto.setSelectedVehicle(vehicleDto);
        }
        
        return dayDetailDto;
    }
}