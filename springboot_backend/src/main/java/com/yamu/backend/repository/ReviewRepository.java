package com.yamu.backend.repository;

import com.yamu.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByGuideId(Long guideId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.guide.id = :guideId")
    Optional<Double> findAverageRatingByGuideId(Long guideId);

    Optional<Review> findByTravelerIdAndGuideId(Long travelerId, Long guideId);

    // New methods for fetching reviews ordered by creation date
    @Query("SELECT r FROM Review r WHERE r.guide.id = :guideId ORDER BY r.createdAt DESC")
    List<Review> findByGuideIdOrderByCreatedAtDesc(Long guideId);

    @Query("SELECT r FROM Review r WHERE r.guide.id = :guideId ORDER BY r.createdAt DESC")
    Page<Review> findByGuideIdOrderByCreatedAtDesc(Long guideId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.traveler.id = :travelerId ORDER BY r.createdAt DESC")
    List<Review> findByTravelerIdOrderByCreatedAtDesc(Long travelerId);

    @Query("SELECT r FROM Review r WHERE r.traveler.id = :travelerId ORDER BY r.createdAt DESC")
    Page<Review> findByTravelerIdOrderByCreatedAtDesc(Long travelerId, Pageable pageable);
}