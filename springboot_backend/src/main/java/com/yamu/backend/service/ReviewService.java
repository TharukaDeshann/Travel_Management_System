package com.yamu.backend.service;

import com.yamu.backend.controller.UserController;
import com.yamu.backend.dto.ReviewDto;
import com.yamu.backend.dto.ReviewResponseDto;
import com.yamu.backend.enums.UserRole;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.exception.UnauthorizedAccessException;
import com.yamu.backend.model.Review;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.model.User;
import com.yamu.backend.model.Guide;
import com.yamu.backend.repository.ReviewRepository;
import com.yamu.backend.repository.TravelerRepository;
import com.yamu.backend.repository.GuideRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final TravelerRepository travelerRepository;
    private final GuideRepository guideRepository;
    private final UserController userController;

    public ReviewService(ReviewRepository reviewRepository, 
                       TravelerRepository travelerRepository,
                       GuideRepository guideRepository,
                       UserController userController) {
        this.reviewRepository = reviewRepository;
        this.travelerRepository = travelerRepository;
        this.guideRepository = guideRepository;
        this.userController = userController;
    }

    @Transactional
    public ReviewResponseDto createOrUpdateReview(Long travelerId, Long guideId, ReviewDto reviewDto) {
        Traveler traveler = travelerRepository.findById(travelerId)
            .orElseThrow(() -> new ResourceNotFoundException("Traveler not found with id: " + travelerId));
            
        Guide guide = guideRepository.findById(guideId)
            .orElseThrow(() -> new ResourceNotFoundException("Guide not found with id: " + guideId));
            
        Optional<Review> existingReview = reviewRepository.findByTravelerIdAndGuideId(travelerId, guideId);
        
        Review review;
        if (existingReview.isPresent()) {
            review = existingReview.get();
            review.setRating(reviewDto.getRating());
            review.setComment(reviewDto.getComment());
            review.setUpdatedAt(LocalDateTime.now());
        } else {
            review = new Review();
            review.setTraveler(traveler);
            review.setGuide(guide);
            review.setRating(reviewDto.getRating());
            review.setComment(reviewDto.getComment());
        }
        
        Review savedReview = reviewRepository.save(review);
        return convertToDto(savedReview);
    }

    public List<ReviewResponseDto> getReviewsByGuideId(Long guideId, Integer page, Integer size) {
        List<Review> reviews;
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size);
            Page<Review> reviewPage = reviewRepository.findByGuideIdOrderByCreatedAtDesc(guideId, pageable);
            reviews = reviewPage.getContent();
        } else {
            reviews = reviewRepository.findByGuideIdOrderByCreatedAtDesc(guideId);
        }
        return reviews.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<ReviewResponseDto> getReviewsByTravelerId(Long travelerId, Integer page, Integer size) {
        List<Review> reviews;
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size);
            Page<Review> reviewPage = reviewRepository.findByTravelerIdOrderByCreatedAtDesc(travelerId, pageable);
            reviews = reviewPage.getContent();
        } else {
            reviews = reviewRepository.findByTravelerIdOrderByCreatedAtDesc(travelerId);
        }
        return reviews.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Double getAverageRatingForGuide(Long guideId) {
        return reviewRepository.findAverageRatingByGuideId(guideId).orElse(0.0);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        
        User currentUser = userController.getCurrentUser();

        if (!review.getTraveler().getId().equals(userId) && !currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new UnauthorizedAccessException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
    }

    private ReviewResponseDto convertToDto(Review review) {
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(review.getId());
        dto.setTravelerId(review.getTraveler().getId());
        dto.setTravelerName(review.getTraveler().getFirstName() + " " + review.getTraveler().getLastName());
        dto.setGuideId(review.getGuide().getId());
        dto.setGuideName(review.getGuide().getFirstName() + " " + review.getGuide().getLastName());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        return dto;
    }
}