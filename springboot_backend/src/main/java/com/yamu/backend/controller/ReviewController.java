package com.yamu.backend.controller;

import com.yamu.backend.dto.ReviewDto;
import com.yamu.backend.dto.ReviewResponseDto;
import com.yamu.backend.model.User;
import com.yamu.backend.service.ReviewService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/guide/{guideId}")
    public ResponseEntity<ReviewResponseDto> createOrUpdateReview(
            @PathVariable Long guideId,
            @RequestBody @Valid ReviewDto reviewDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long travelerId = ((User) authentication.getPrincipal()).getId();
        
        ReviewResponseDto response = reviewService.createOrUpdateReview(travelerId, guideId, reviewDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/guide/{guideId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsForGuide(
            @PathVariable Long guideId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsByGuideId(guideId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/guide/{guideId}/average-rating")
    public ResponseEntity<Double> getAverageRatingForGuide(@PathVariable Long guideId) {
        Double averageRating = reviewService.getAverageRatingForGuide(guideId);
        return ResponseEntity.ok(averageRating);
    }

    @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByTraveler(
            @PathVariable Long travelerId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsByTravelerId(travelerId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = ((User) authentication.getPrincipal()).getId();
        
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}