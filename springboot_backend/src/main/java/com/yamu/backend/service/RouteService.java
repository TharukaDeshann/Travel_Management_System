package com.yamu.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.yamu.backend.dto.*;
import com.yamu.backend.model.Location;
import com.yamu.backend.model.Route;
import com.yamu.backend.repository.RouteRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    @Autowired
    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public List<RouteResponse> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(this::convertToRouteResponse)
                .collect(Collectors.toList());
    }

    public Optional<RouteResponse> getRouteById(long id) {
        return routeRepository.findById(id)
                .map(this::convertToRouteResponse);
    }

    @Transactional
    public RouteResponse createRoute(RouteCreateRequest request) {
        Route route = new Route();
        route.setName(request.getName());
        route.setTravelMode(request.getTravelMode());
        route.setTotalDistance(request.getTotalDistance());
        route.setEstimatedTime(request.getEstimatedTime());
        
        if (request.getLocations() != null) {
            for (LocationCreateRequest locRequest : request.getLocations()) {
                Location location = new Location();
                location.setName(locRequest.getName());
                location.setLatitude(locRequest.getLatitude());
                location.setLongitude(locRequest.getLongitude());
                location.setPositionIndex(locRequest.getPositionIndex());
                location.setPlaceId(locRequest.getPlaceId());
                location.setAddress(locRequest.getAddress());
                location.setNotes(locRequest.getNotes());
                
                route.getLocations().add(location);
            }
        }
        
        Route savedRoute = routeRepository.save(route);
        return convertToRouteResponse(savedRoute);
    }

    @Transactional
    public void deleteRoute(long id) {
        if (!routeRepository.existsById(id)) {
            throw new RuntimeException("Route not found");
        }
        routeRepository.deleteById(id);
    }

    @Transactional
    public RouteResponse updateRoute(long id, RouteCreateRequest request) {
        Optional<Route> optionalRoute = routeRepository.findById(id);
        if (optionalRoute.isEmpty()) {
            throw new RuntimeException("Route not found");
        }
        
        Route route = optionalRoute.get();
        route.setName(request.getName());
        route.setTravelMode(request.getTravelMode());
        route.setTotalDistance(request.getTotalDistance());
        route.setEstimatedTime(request.getEstimatedTime());
        
        // Clear existing locations and add new ones
        route.getLocations().clear();
        
        if (request.getLocations() != null) {
            for (LocationCreateRequest locRequest : request.getLocations()) {
                Location location = new Location();
                location.setName(locRequest.getName());
                location.setLatitude(locRequest.getLatitude());
                location.setLongitude(locRequest.getLongitude());
                location.setPositionIndex(locRequest.getPositionIndex());
                location.setPlaceId(locRequest.getPlaceId());
                location.setAddress(locRequest.getAddress());
                location.setNotes(locRequest.getNotes());
                
                route.getLocations().add(location);
            }
        }
        
        Route savedRoute = routeRepository.save(route);
        return convertToRouteResponse(savedRoute);
    }

    private RouteResponse convertToRouteResponse(Route route) {
        RouteResponse response = new RouteResponse();
        response.setId(route.getId());
        response.setName(route.getName());
        response.setTravelMode(route.getTravelMode());
        response.setTotalDistance(route.getTotalDistance());
        response.setEstimatedTime(route.getEstimatedTime());
        
        List<LocationResponse> locationResponses = route.getLocations().stream()
                .map(location -> {
                    LocationResponse locResponse = new LocationResponse();
                    locResponse.setId(location.getId());
                    locResponse.setName(location.getName());
                    locResponse.setLatitude(location.getLatitude());
                    locResponse.setLongitude(location.getLongitude());
                    locResponse.setPositionIndex(location.getPositionIndex());
                    locResponse.setPlaceId(location.getPlaceId());
                    locResponse.setAddress(location.getAddress());
                    locResponse.setNotes(location.getNotes());
                    return locResponse;
                })
                .collect(Collectors.toList());
        
        response.setLocations(locationResponses);
        return response;
    }
}