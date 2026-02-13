package com.yamu.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import com.yamu.backend.dto.GuideReservationResponse;
import com.yamu.backend.dto.ReviewResponseDto;
import com.yamu.backend.dto.UserDto;
import com.yamu.backend.dto.UserResponseDTO;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.model.GuideReservationByTraveler;
import com.yamu.backend.model.GuideReservationDayDetail;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.GuideReservationByTravelerService;
import com.yamu.backend.service.ReviewService;
import com.yamu.backend.service.UserService;

@RestController
@RequestMapping("/api/admin/guides")
public class AdminGuidesController {
    private final UserService userService;
    private final GuideReservationByTravelerService reservationService;
    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final UserController userController;

    public AdminGuidesController(UserService userService, GuideReservationByTravelerService reservationService,
     ReviewService reviewService, UserRepository userRepository, UserController userController) {

        this.userService = userService;
        this.reservationService = reservationService;
        this.reviewService = reviewService;
        this.userRepository = userRepository;
        this.userController = userController;
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

    

    // Get reservations for a specific guide
    @GetMapping("/{guideId}/guide-reservations")
    public ResponseEntity<List<GuideReservationResponse>> getGuideReservations(
            @PathVariable Long guideId) {
        List<GuideReservationByTraveler> reservations = reservationService.getReservationsForGuide(guideId);
        List<GuideReservationResponse> response = reservations.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{guideId}/guide-reviews")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsForGuide(
            @PathVariable Long guideId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        try {
            List<ReviewResponseDto> reviews = reviewService.getReviewsByGuideId(guideId, page, size);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{guideId}/average-rating")
    public ResponseEntity<Double> getAverageRatingForGuide(@PathVariable Long guideId) {
        try {
            Double averageRating = reviewService.getAverageRatingForGuide(guideId);
            return ResponseEntity.ok(averageRating);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get guides
    @GetMapping("/role/GUIDE")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRole() {
        return ResponseEntity.ok(userService.getUsersByRole(UserRole.GUIDE));
    }

    // Delete guide (soft delete)
    @DeleteMapping("/{id}/delete-user")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        User currentUser = userController.getCurrentUser();
        if (currentUser.getId() != id && currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this user");
        }
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @DeleteMapping("/{reviewId}/delete-review")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            Long userId = user.getId();
            reviewService.deleteReview(reviewId, userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
