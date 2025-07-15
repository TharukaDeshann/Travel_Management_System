package com.yamu.backend.controller;

import com.yamu.backend.dto.ReviewDto;
import com.yamu.backend.dto.ReviewResponseDto;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.service.ReviewService;
import com.yamu.backend.service.GuideReservationByTravelerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final GuideReservationByTravelerService reservationService;

    public ReviewController(ReviewService reviewService, UserRepository userRepository, 
                          GuideReservationByTravelerService reservationService) {
        this.userRepository = userRepository;
        this.reviewService = reviewService;
        this.reservationService = reservationService;
    }

    @PostMapping("/guide/{guideId}")
    public ResponseEntity<?> createOrUpdateReview(
            @PathVariable Long guideId,
            @RequestBody @Valid ReviewDto reviewDto) {
        
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            Long travelerId = user.getId();
            
            // Check if the traveler has previously completed a booking with this guide
            if (!reservationService.hasCompletedReservationWithGuide(travelerId, guideId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only review guides you have previously booked and completed a trip with.");
            }
            
            ReviewResponseDto response = reviewService.createOrUpdateReview(travelerId, guideId, reviewDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/guide/{guideId}")
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

    @GetMapping("/guide/{guideId}/average-rating")
    public ResponseEntity<Double> getAverageRatingForGuide(@PathVariable Long guideId) {
        try {
            Double averageRating = reviewService.getAverageRatingForGuide(guideId);
            return ResponseEntity.ok(averageRating);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByTraveler(
            @PathVariable Long travelerId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        try {
            List<ReviewResponseDto> reviews = reviewService.getReviewsByTravelerId(travelerId, page, size);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{reviewId}")
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