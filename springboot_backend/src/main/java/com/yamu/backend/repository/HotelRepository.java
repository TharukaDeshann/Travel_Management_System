package com.yamu.backend.repository;

import com.yamu.backend.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    Optional<Hotel> findByGooglePlaceId(String googlePlaceId);
    
    List<Hotel> findByRatingGreaterThanEqual(Double minRating);
    
    @Query("SELECT h FROM Hotel h WHERE h.rating >= :minRating ORDER BY h.rating DESC")
    List<Hotel> findByMinRatingOrderByRatingDesc(@Param("minRating") Double minRating);
    
    @Query(value = """
        SELECT h.*, 
               (6371 * acos(cos(radians(:latitude)) * cos(radians(h.latitude)) * 
               cos(radians(h.longitude) - radians(:longitude)) + 
               sin(radians(:latitude)) * sin(radians(h.latitude)))) AS distance
        FROM hotels h
        HAVING distance <= :radiusKm
        ORDER BY distance
        """, nativeQuery = true)
    List<Hotel> findHotelsWithinRadius(@Param("latitude") Double latitude, 
                                     @Param("longitude") Double longitude, 
                                     @Param("radiusKm") Double radiusKm);
    
    @Query(value = """
        SELECT * FROM (
            SELECT h.*, 
                   (6371 * acos(cos(radians(?1)) * cos(radians(h.latitude)) * 
                   cos(radians(h.longitude) - radians(?2)) + 
                   sin(radians(?1)) * sin(radians(h.latitude)))) AS distance
            FROM hotels h
            WHERE h.rating >= ?4
        ) AS hotel_distances
        WHERE distance <= ?3
        ORDER BY rating DESC, distance
        """, nativeQuery = true)
    List<Hotel> findHotelsNearRouteWithFilters(@Param("latitude") Double latitude,
                                             @Param("longitude") Double longitude,
                                             @Param("radiusKm") Double radiusKm,
                                             @Param("minRating") Double minRating);
    
    // Alternative method using Pageable for limiting results
    @Query("SELECT h FROM Hotel h WHERE " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(h.latitude)) * " +
           "cos(radians(h.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(h.latitude)))) <= :radiusKm " +
           "AND h.rating >= :minRating " +
           "ORDER BY h.rating DESC")
    List<Hotel> findHotelsNearRouteWithFiltersJPQL(@Param("latitude") Double latitude,
                                                 @Param("longitude") Double longitude,
                                                 @Param("radiusKm") Double radiusKm,
                                                 @Param("minRating") Double minRating,
                                                 org.springframework.data.domain.Pageable pageable);
}
