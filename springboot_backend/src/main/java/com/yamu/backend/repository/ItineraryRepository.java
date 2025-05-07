package com.yamu.backend.repository;

import com.yamu.backend.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItineraryRepository extends JpaRepository<Itinerary, String> {
}