package com.yamu.backend.service;

import com.yamu.backend.dto.ItineraryRequest;
import com.yamu.backend.model.*;
import com.yamu.backend.repository.ItineraryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ItineraryService {
    @Autowired
    private ItineraryRepository itineraryRepository;

    public Itinerary saveItinerary(ItineraryRequest request) {
        Itinerary itinerary = new Itinerary();
        itinerary.setId(UUID.randomUUID().toString());
        itinerary.setUserId(request.getUserId());
        itinerary.setTripTitle(request.getTripTitle());
        itinerary.setStartDate(request.getStartDate());
        itinerary.setEndDate(request.getEndDate());
        itinerary.setBudget(request.getBudget());
        itinerary.setCurrency(request.getCurrency());

        for (ItineraryRequest.DayPlanRequest dayPlanRequest : request.getDayPlans()) {
            DayPlan dayPlan = new DayPlan();
            dayPlan.setId(UUID.randomUUID().toString());
            dayPlan.setDate(dayPlanRequest.getDate());
            dayPlan.setItinerary(itinerary);

            for (ItineraryRequest.DayPlanRequest.LocationRequest locationRequest : dayPlanRequest.getLocations()) {
                Location location = new Location();
                location.setName(locationRequest.getName());
                location.setAddress(locationRequest.getAddress());
                location.setLatitude(locationRequest.getLatitude());
                location.setLongitude(locationRequest.getLongitude());
                location.setPositionIndex(locationRequest.getPositionIndex());
                location.setPlaceId(locationRequest.getPlaceId());
                location.setNotes(locationRequest.getNotes());
                location.setDayPlan(dayPlan);

                dayPlan.getLocations().add(location);
            }

            itinerary.getDayPlans().add(dayPlan);
        }

        return itineraryRepository.save(itinerary);
    }
}