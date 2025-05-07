package com.yamu.backend.controller;

import com.azure.core.exception.ResourceNotFoundException;
import com.yamu.backend.dto.GuideReservationRequest;
import com.yamu.backend.model.GuideReservation;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.GuideReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guide/reservations")
public class GuideReservationController {

    private final GuideReservationService reservationService;
    private final UserRepository userRepository;

    public GuideReservationController(GuideReservationService reservationService, 
                                    UserRepository userRepository) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<GuideReservation>> getGuideReservations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found", null));
        List<GuideReservation> reservations = reservationService.getGuideReservations(user.getId());
        return ResponseEntity.ok(reservations);
    }

    @PostMapping
    public ResponseEntity<GuideReservation> createReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody GuideReservationRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found", null));
        
        if (request.getDate() == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        
        GuideReservation reservation = reservationService.createReservation(user.getId(), request);
        return ResponseEntity.ok(reservation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found", null));
        reservationService.deleteReservation(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}