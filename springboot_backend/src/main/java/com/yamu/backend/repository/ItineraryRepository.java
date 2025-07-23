package com.yamu.backend.repository;

import com.yamu.backend.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.yamu.backend.dto.ItinerarySummaryResponseDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByTravelerId(Long travelerId);

    @Query("SELECT new com.yamu.backend.dto.ItinerarySummaryResponseDTO(i.id, i.tripTitle, i.startDate, i.endDate, i.budget, i.currency) FROM Itinerary i WHERE i.traveler.id = :travelerId ORDER BY i.startDate DESC")
    List<ItinerarySummaryResponseDTO> findSummariesByTravelerId(@Param("travelerId") Long travelerId);
}