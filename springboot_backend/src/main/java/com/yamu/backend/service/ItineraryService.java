package com.yamu.backend.service;

import com.yamu.backend.dto.ItineraryCreateRequest;
import com.yamu.backend.dto.ItineraryDetailResponse;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.repository.ItineraryRepository;
import com.yamu.backend.repository.TravelerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private TravelerRepository travelerRepository;

    public ItineraryDetailResponse createItinerary(ItineraryCreateRequest request) {
        Traveler traveler = travelerRepository.findById(request.getTravelerId())
                .orElseThrow(() -> new RuntimeException("Traveler not found"));

        Itinerary itinerary = new Itinerary();
        itinerary.setBudget(request.getBudget());
        itinerary.setCurrency(request.getCurrency());
        itinerary.setStartDate(request.getStartDate());
        itinerary.setEndDate(request.getEndDate());
        itinerary.setTripTitle(request.getTripTitle());
        itinerary.setTraveler(traveler);

        Itinerary saved = itineraryRepository.save(itinerary);

        ItineraryDetailResponse response = new ItineraryDetailResponse();
        response.setId(saved.getId());
        response.setBudget(saved.getBudget());
        response.setCurrency(saved.getCurrency());
        response.setStartDate(saved.getStartDate());
        response.setEndDate(saved.getEndDate());
        response.setTripTitle(saved.getTripTitle());
        response.setTravelerId(saved.getTraveler().getId());
        return response;
    }
}