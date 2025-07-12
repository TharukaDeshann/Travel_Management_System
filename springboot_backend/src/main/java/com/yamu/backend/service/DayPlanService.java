package com.yamu.backend.service;

import com.yamu.backend.dto.DayPlanCreateRequest;
import com.yamu.backend.dto.DayPlanDetailResponse;
import com.yamu.backend.dto.LocationCreateRequest;
import com.yamu.backend.dto.LocationDetailResponse;
import com.yamu.backend.dto.RouteCreateRequest;
import com.yamu.backend.dto.RouteDetailResponse;
import com.yamu.backend.model.DayPlan;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.model.Location;
import com.yamu.backend.model.Route;
import com.yamu.backend.model.GuideReservationByTraveler;
import com.yamu.backend.repository.DayPlanRepository;
import com.yamu.backend.repository.ItineraryRepository;
import com.yamu.backend.repository.LocationRepository;
import com.yamu.backend.repository.GuideReservationByTravelerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DayPlanService {

    @Autowired
    private DayPlanRepository dayPlanRepository;
    
    @Autowired
    private ItineraryRepository itineraryRepository;
    
    @Autowired
    private LocationRepository locationRepository;
    
    // Removed unused RouteRepository
    // @Autowired
    // private RouteRepository routeRepository;
    
    @Autowired
    private RouteService routeService; // New service for route operations
    
    @Autowired
    private GuideReservationByTravelerRepository reservationRepository; // For linking guide reservations

    @Transactional
    public DayPlanDetailResponse createDayPlan(Long itineraryId, DayPlanCreateRequest request) {
        // Validate itinerary exists
        Optional<Itinerary> itineraryOpt = itineraryRepository.findById(itineraryId);
        if (itineraryOpt.isEmpty()) {
            throw new RuntimeException("Itinerary not found!");
        }
        
        Itinerary itinerary = itineraryOpt.get();
        
        // Create new day plan
        DayPlan dayPlan = new DayPlan();
        dayPlan.setDate(request.getDate());
        dayPlan.setHotelDetails(request.getHotelDetails());
        dayPlan.setTransportDetails(request.getTransportDetails());
        dayPlan.setGuideDetails(request.getGuideDetails());
        dayPlan.setItinerary(itinerary);
        
        // Link guide reservation if provided
        if (request.getGuideReservationId() != null) {
            GuideReservationByTraveler reservation = reservationRepository.findById(request.getGuideReservationId())
                .orElseThrow(() -> new RuntimeException("Guide reservation not found"));
            dayPlan.setGuideReservation(reservation);
        }
        
        // Save dayPlan first to generate ID
        dayPlan = dayPlanRepository.save(dayPlan);
        
        // Create and link Route
        if (request.getRoute() != null) {
            RouteCreateRequest routeReq = request.getRoute();
            Route route = new Route();
            route.setName(routeReq.getName());
            route.setTravelMode(routeReq.getTravelMode());
            route.setTotalDistance(routeReq.getTotalDistance());
            route.setEstimatedTime(routeReq.getEstimatedTime());
            route.setDayPlan(dayPlan);
            
            // Save route using service
            route = routeService.saveRoute(route);
            dayPlan.setRoute(route);
        }
        
        // Create and link Locations
        List<Location> locations = new ArrayList<>();
        if (request.getLocations() != null) {
            for (LocationCreateRequest locReq : request.getLocations()) {
                Location loc = new Location();
                loc.setName(locReq.getName());
                loc.setAddress(locReq.getAddress());
                loc.setLatitude(locReq.getLatitude());
                loc.setLongitude(locReq.getLongitude());
                loc.setPositionIndex(locReq.getPositionIndex());
                loc.setPlaceId(locReq.getPlaceId());
                loc.setNotes(locReq.getNotes());
                loc.setDayPlan(dayPlan);
                if (dayPlan.getRoute() != null) {
                    loc.setRoute(dayPlan.getRoute());
                }
                locations.add(loc);
            }
            
            // Save all locations at once
            locationRepository.saveAll(locations);
            dayPlan.setLocations(locations);
        }
        
        // Save the updated day plan with relationships
        dayPlan = dayPlanRepository.save(dayPlan);
        
        // Build response with all details
        return buildDayPlanResponse(dayPlan);
    }
    
    private DayPlanDetailResponse buildDayPlanResponse(DayPlan dayPlan) {
        DayPlanDetailResponse response = new DayPlanDetailResponse();
        response.setId(dayPlan.getId());
        response.setDate(dayPlan.getDate());
        response.setHotelDetails(dayPlan.getHotelDetails());
        response.setTransportDetails(dayPlan.getTransportDetails());
        response.setGuideDetails(dayPlan.getGuideDetails());
        
        // Add guide reservation ID if exists
        if (dayPlan.getGuideReservation() != null) {
            response.setGuideReservationId(dayPlan.getGuideReservation().getId());
        } else {
            response.setGuideReservationId(null);
        }
        
        // Map locations
        List<LocationDetailResponse> locationResponses = new ArrayList<>();
        for (Location location : dayPlan.getLocations()) {
            LocationDetailResponse locResp = new LocationDetailResponse();
            locResp.setId(location.getId());
            locResp.setName(location.getName());
            locResp.setAddress(location.getAddress());
            locResp.setLatitude(location.getLatitude());
            locResp.setLongitude(location.getLongitude());
            locResp.setPositionIndex(location.getPositionIndex());
            locResp.setPlaceId(location.getPlaceId());
            locResp.setNotes(location.getNotes());
            locationResponses.add(locResp);
        }
        response.setLocations(locationResponses);
        
        // Map route if exists
        if (dayPlan.getRoute() != null) {
            RouteDetailResponse routeResp = new RouteDetailResponse();
            routeResp.setId(dayPlan.getRoute().getId());
            routeResp.setName(dayPlan.getRoute().getName());
            routeResp.setTravelMode(dayPlan.getRoute().getTravelMode());
            routeResp.setTotalDistance(dayPlan.getRoute().getTotalDistance());
            routeResp.setEstimatedTime(dayPlan.getRoute().getEstimatedTime());
            response.setRoute(routeResp);
        }
        
                return response;
            }
        }