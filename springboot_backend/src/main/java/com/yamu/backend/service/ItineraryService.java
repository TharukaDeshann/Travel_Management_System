package com.yamu.backend.service;

import com.yamu.backend.dto.ItineraryCreateRequest;
import com.yamu.backend.dto.ItineraryDetailResponse;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.repository.ItineraryRepository;
import com.yamu.backend.repository.TravelerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;
import com.yamu.backend.dto.DayPlanDetailResponse;
import com.yamu.backend.dto.LocationDetailResponse;
import com.yamu.backend.dto.RouteDetailResponse;

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

    public Optional<Itinerary> getItineraryById(Long id) {
        return itineraryRepository.findById(id);
    }

    public ItineraryDetailResponse mapToDetailResponse(Itinerary itinerary) {
        ItineraryDetailResponse response = new ItineraryDetailResponse();
        response.setId(itinerary.getId());
        response.setBudget(itinerary.getBudget());
        response.setCurrency(itinerary.getCurrency());
        response.setStartDate(itinerary.getStartDate());
        response.setEndDate(itinerary.getEndDate());
        response.setTripTitle(itinerary.getTripTitle());
        response.setTravelerId(itinerary.getTraveler().getId());
        if (itinerary.getDayPlans() != null) {
            response.setDayPlans(itinerary.getDayPlans().stream().map(dayPlan -> {
                DayPlanDetailResponse d = new DayPlanDetailResponse();
                d.setId(dayPlan.getId());
                d.setDate(dayPlan.getDate());
                d.setHotelDetails(dayPlan.getHotelDetails());
                d.setTransportDetails(dayPlan.getTransportDetails());
                // Map locations
                if (dayPlan.getLocations() != null) {
                    d.setLocations(dayPlan.getLocations().stream().map(loc -> {
                        LocationDetailResponse l = new LocationDetailResponse();
                        l.setId(loc.getId());
                        l.setName(loc.getName());
                        l.setAddress(loc.getAddress());
                        l.setLatitude(loc.getLatitude());
                        l.setLongitude(loc.getLongitude());
                        l.setPositionIndex(loc.getPositionIndex());
                        l.setPlaceId(loc.getPlaceId());
                        l.setNotes(loc.getNotes());
                        return l;
                    }).collect(Collectors.toList()));
                }
                // Map route
                if (dayPlan.getRoute() != null) {
                    RouteDetailResponse r = new RouteDetailResponse();
                    r.setId(dayPlan.getRoute().getId());
                    r.setName(dayPlan.getRoute().getName());
                    r.setTravelMode(dayPlan.getRoute().getTravelMode());
                    r.setTotalDistance(dayPlan.getRoute().getTotalDistance());
                    r.setEstimatedTime(dayPlan.getRoute().getEstimatedTime());
                    d.setRoute(r);
                } else {
                    d.setRoute(null);
                }
                return d;
            }).collect(Collectors.toList()));
        }
        return response;
    }
}