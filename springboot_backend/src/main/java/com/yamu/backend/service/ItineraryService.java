package com.yamu.backend.service;

import com.yamu.backend.dto.DayPlanCreateRequest;
import com.yamu.backend.dto.DayPlanDetailResponse;
import com.yamu.backend.dto.ItineraryCreateRequest;
import com.yamu.backend.dto.ItineraryDetailResponse;
import com.yamu.backend.dto.LocationCreateRequest;
import com.yamu.backend.dto.LocationDetailResponse;
import com.yamu.backend.dto.RouteDetailResponse;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.model.DayPlan;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.model.Location;
import com.yamu.backend.model.Route;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.repository.ItineraryRepository;
import com.yamu.backend.repository.TravelerRepository;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;
    
    @Autowired
    private TravelerRepository travelerRepository;
    
    @Autowired
    private ModelMapper modelMapper;  // You'll need to configure this bean
    
    /**
     * Creates a complete itinerary with day plans, routes, and locations in a single transaction
     */
    @Transactional
    public ItineraryDetailResponse createItinerary(ItineraryCreateRequest request) {
        // Fetch the traveler
        Traveler traveler = travelerRepository.findById(request.getTravelerId())
                .orElseThrow(() -> new ResourceNotFoundException("Traveler not found with id: " + request.getTravelerId()));
                
        // Create the itinerary
        Itinerary itinerary = new Itinerary();
        itinerary.setBudget(request.getBudget());
        itinerary.setCurrency(request.getCurrency());
        itinerary.setStartDate(request.getStartDate());
        itinerary.setEndDate(request.getEndDate());
        itinerary.setTripTitle(request.getTripTitle());
        itinerary.setTraveler(traveler);
        
        // Create day plans
        List<DayPlan> dayPlans = new ArrayList<>();
        
        for (DayPlanCreateRequest dayPlanRequest : request.getDayPlans()) {
            DayPlan dayPlan = new DayPlan();
            dayPlan.setDate(dayPlanRequest.getDate());
            dayPlan.setHotelDetails(dayPlanRequest.getHotelDetails());
            dayPlan.setTransportDetails(dayPlanRequest.getTransportDetails());
            dayPlan.setGuideDetails(dayPlanRequest.getGuideDetails());
            dayPlan.setItinerary(itinerary);
            
            // Create locations
            List<Location> locations = new ArrayList<>();
            if (dayPlanRequest.getLocations() != null) {
                for (LocationCreateRequest locationRequest : dayPlanRequest.getLocations()) {
                    Location location = new Location();
                    location.setName(locationRequest.getName());
                    location.setAddress(locationRequest.getAddress());
                    location.setLatitude(locationRequest.getLatitude());
                    location.setLongitude(locationRequest.getLongitude());
                    location.setPositionIndex(locationRequest.getPositionIndex());
                    location.setPlaceId(locationRequest.getPlaceId());
                    location.setNotes(locationRequest.getNotes());
                    location.setDayPlan(dayPlan);
                    locations.add(location);
                }
            }
            
            // Create route if needed (when there are multiple locations)
            if (dayPlanRequest.getRoute() != null) {
                Route route = new Route();
                route.setName(dayPlanRequest.getRoute().getName());
                route.setTravelMode(dayPlanRequest.getRoute().getTravelMode());
                route.setTotalDistance(dayPlanRequest.getRoute().getTotalDistance());
                route.setEstimatedTime(dayPlanRequest.getRoute().getEstimatedTime());
                route.setDayPlan(dayPlan);
                
                // Associate route with its locations
                if (locations.size() > 1) {
                    for (Location location : locations) {
                        location.setRoute(route);
                    }
                    route.setLocations(locations);
                }
                
                dayPlan.setRoute(route);
            }
            
            dayPlan.setLocations(locations);
            dayPlans.add(dayPlan);
        }
        
        itinerary.setDayPlans(dayPlans);
        
        // Save the entire object graph
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        
        // Map to response DTO and return
        return mapToDetailResponse(savedItinerary);
    }
    
    /**
     * Get itinerary by ID with all its details
     */
    @Transactional(readOnly = true)
    public ItineraryDetailResponse getItineraryById(Long id) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary not found with id: " + id));
        
        return mapToDetailResponse(itinerary);
    }
    
    /**
     * Get all itineraries for a specific traveler
     */
    @Transactional(readOnly = true)
    public List<ItineraryDetailResponse> getItinerariesByTravelerId(Long travelerId) {
        // First check if traveler exists
        travelerRepository.findById(travelerId)
                .orElseThrow(() -> new ResourceNotFoundException("Traveler not found with id: " + travelerId));
        
        List<Itinerary> itineraries = itineraryRepository.findByTravelerId(travelerId);
        
        return itineraries.stream()
                .map(this::mapToDetailResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Update an existing itinerary
     */
    @Transactional
    public ItineraryDetailResponse updateItinerary(Long id, ItineraryCreateRequest request) {
        // Check if itinerary exists
        Itinerary existingItinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary not found with id: " + id));
        
        // Check if traveler exists
        Traveler traveler = travelerRepository.findById(request.getTravelerId())
                .orElseThrow(() -> new ResourceNotFoundException("Traveler not found with id: " + request.getTravelerId()));
        
        // Update basic itinerary information
        existingItinerary.setBudget(request.getBudget());
        existingItinerary.setCurrency(request.getCurrency());
        existingItinerary.setStartDate(request.getStartDate());
        existingItinerary.setEndDate(request.getEndDate());
        existingItinerary.setTripTitle(request.getTripTitle());
        existingItinerary.setTraveler(traveler);
        
        // Delete existing day plans and create new ones
        // This is a simple approach - a more sophisticated implementation might diff and update
        existingItinerary.getDayPlans().clear();
        
        List<DayPlan> dayPlans = new ArrayList<>();
        
        for (DayPlanCreateRequest dayPlanRequest : request.getDayPlans()) {
            DayPlan dayPlan = new DayPlan();
            dayPlan.setDate(dayPlanRequest.getDate());
            dayPlan.setHotelDetails(dayPlanRequest.getHotelDetails());
            dayPlan.setTransportDetails(dayPlanRequest.getTransportDetails());
            dayPlan.setGuideDetails(dayPlanRequest.getGuideDetails());
            dayPlan.setItinerary(existingItinerary);
            
            // Create locations
            List<Location> locations = new ArrayList<>();
            if (dayPlanRequest.getLocations() != null) {
                for (LocationCreateRequest locationRequest : dayPlanRequest.getLocations()) {
                    Location location = new Location();
                    location.setName(locationRequest.getName());
                    location.setAddress(locationRequest.getAddress());
                    location.setLatitude(locationRequest.getLatitude());
                    location.setLongitude(locationRequest.getLongitude());
                    location.setPositionIndex(locationRequest.getPositionIndex());
                    location.setPlaceId(locationRequest.getPlaceId());
                    location.setNotes(locationRequest.getNotes());
                    location.setDayPlan(dayPlan);
                    locations.add(location);
                }
            }
            
            // Create route if needed
            if (dayPlanRequest.getRoute() != null) {
                Route route = new Route();
                route.setName(dayPlanRequest.getRoute().getName());
                route.setTravelMode(dayPlanRequest.getRoute().getTravelMode());
                route.setTotalDistance(dayPlanRequest.getRoute().getTotalDistance());
                route.setEstimatedTime(dayPlanRequest.getRoute().getEstimatedTime());
                route.setDayPlan(dayPlan);
                
                // Associate route with its locations
                if (locations.size() > 1) {
                    for (Location location : locations) {
                        location.setRoute(route);
                    }
                    route.setLocations(locations);
                }
                
                dayPlan.setRoute(route);
            }
            
            dayPlan.setLocations(locations);
            dayPlans.add(dayPlan);
        }
        
        existingItinerary.getDayPlans().clear(); // keep the original list object
        existingItinerary.getDayPlans().addAll(dayPlans); // add new ones

        
        // Save the updated itinerary
        Itinerary updatedItinerary = itineraryRepository.save(existingItinerary);
        
        return mapToDetailResponse(updatedItinerary);
    }
    
    /**
     * Delete an itinerary by ID
     */
    @Transactional
    public void deleteItinerary(Long id) {
        // Check if itinerary exists
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary not found with id: " + id));
        
        // Delete the itinerary - cascading should handle child entities
        itineraryRepository.delete(itinerary);
    }
    
    /**
     * Maps the entity to a detailed response DTO
     */
    private ItineraryDetailResponse mapToDetailResponse(Itinerary itinerary) {
        // This could be implemented with a mapping library like ModelMapper
        // For now, a simple manual mapping implementation
        ItineraryDetailResponse response = new ItineraryDetailResponse();
        response.setId(itinerary.getId());
        response.setBudget(itinerary.getBudget());
        response.setCurrency(itinerary.getCurrency());
        response.setStartDate(itinerary.getStartDate());
        response.setEndDate(itinerary.getEndDate());
        response.setTripTitle(itinerary.getTripTitle());
        
        List<DayPlanDetailResponse> dayPlanResponses = itinerary.getDayPlans().stream()
                .map(this::mapToDayPlanResponse)
                .collect(Collectors.toList());
                
        response.setDayPlans(dayPlanResponses);
        
        return response;
    }
    
    private DayPlanDetailResponse mapToDayPlanResponse(DayPlan dayPlan) {
        DayPlanDetailResponse response = new DayPlanDetailResponse();
        response.setId(dayPlan.getId());
        response.setDate(dayPlan.getDate());
        response.setHotelDetails(dayPlan.getHotelDetails());
        response.setTransportDetails(dayPlan.getTransportDetails());
        response.setGuideDetails(dayPlan.getGuideDetails());
        
        // Map locations
        if (dayPlan.getLocations() != null) {
            List<LocationDetailResponse> locationResponses = dayPlan.getLocations().stream()
                    .map(this::mapToLocationResponse)
                    .collect(Collectors.toList());
            response.setLocations(locationResponses);
        }
        
        // Map route
        if (dayPlan.getRoute() != null) {
            response.setRoute(mapToRouteResponse(dayPlan.getRoute()));
        }
        
        return response;
    }
    
    private LocationDetailResponse mapToLocationResponse(Location location) {
        LocationDetailResponse response = new LocationDetailResponse();
        response.setId(location.getId());
        response.setName(location.getName());
        response.setAddress(location.getAddress());
        response.setLatitude(location.getLatitude());
        response.setLongitude(location.getLongitude());
        response.setPositionIndex(location.getPositionIndex());
        response.setPlaceId(location.getPlaceId());
        response.setNotes(location.getNotes());
        return response;
    }
    
    private RouteDetailResponse mapToRouteResponse(Route route) {
        RouteDetailResponse response = new RouteDetailResponse();
        response.setId(route.getId());
        response.setName(route.getName());
        response.setTravelMode(route.getTravelMode());
        response.setTotalDistance(route.getTotalDistance());
        response.setEstimatedTime(route.getEstimatedTime());
        return response;
    }
}