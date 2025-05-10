package com.yamu.backend.service;

import com.yamu.backend.dto.GuideReservationRequest;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.model.GuideReservation;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.GuideReservationRepository;
import com.yamu.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class GuideReservationService {

    private final GuideReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public GuideReservationService(
            GuideReservationRepository reservationRepository,
            UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    public List<GuideReservation> getGuideReservations(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public GuideReservation createReservation(Long userId, GuideReservationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot reserve a date in the past");
        }

        if (reservationRepository.existsByUserIdAndDate(userId, request.getDate())) {
            throw new IllegalArgumentException("You already have a reservation for this date");
        }

        GuideReservation reservation = new GuideReservation();
        reservation.setUser(user);
        reservation.setDate(request.getDate());
        reservation.setType(request.getType());
        reservation.setTravelerName(request.getTravelerName());
        reservation.setPlace(request.getPlace());
        reservation.setTimePeriod(request.getTimePeriod());

        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Long reservationId, Long userId) {
        if (!reservationRepository.existsByIdAndUserId(reservationId, userId)) {
            throw new ResourceNotFoundException(
                "Reservation not found with id: " + reservationId + " for user: " + userId
            );
        }
        reservationRepository.deleteById(reservationId);
    }
}