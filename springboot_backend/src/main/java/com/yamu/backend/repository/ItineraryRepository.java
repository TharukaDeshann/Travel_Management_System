package com.yamu.backend.repository;

import com.yamu.backend.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    
    /**
     * Find all itineraries belonging to a specific traveler
     * 
     * @param travelerId the ID of the traveler
     * @return list of itineraries
     */
    @Query("SELECT i FROM Itinerary i WHERE i.traveler.id = :travelerId")
    List<Itinerary> findByTravelerId(@Param("travelerId") Long travelerId);
}