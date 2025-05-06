package com.yamu.backend.controller;

import com.yamu.backend.dto.CreateReservationRequest;
import com.yamu.backend.model.GuideReservationByTraveler;
import com.yamu.backend.service.GuideReservationByTravelerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class GuideReservationByTravelerController {

    private final GuideReservationByTravelerService reservationService;

    public GuideReservationByTravelerController(GuideReservationByTravelerService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<GuideReservationByTraveler> createReservation(
            @RequestBody CreateReservationRequest request) {
        return ResponseEntity.ok(reservationService.createReservation(request));
    }

    @GetMapping("/guide/{guideId}")
    public ResponseEntity<List<GuideReservationByTraveler>> getGuideReservations(
            @PathVariable Long guideId) {
        return ResponseEntity.ok(reservationService.getReservationsForGuide(guideId));
    }

    @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<List<GuideReservationByTraveler>> getTravelerReservations(
            @PathVariable Long travelerId) {
        return ResponseEntity.ok(reservationService.getReservationsForTraveler(travelerId));
    }

    @PutMapping("/{reservationId}/confirm")
    public ResponseEntity<GuideReservationByTraveler> confirmReservation(
            @PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(
                reservationId, 
                GuideReservationByTraveler.ReservationStatus.CONFIRMED));
    }

    @PutMapping("/{reservationId}/decline")
    public ResponseEntity<GuideReservationByTraveler> declineReservation(
            @PathVariable Long reservationId) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(
                reservationId, 
                GuideReservationByTraveler.ReservationStatus.DECLINED));
    }
}