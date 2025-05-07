package com.yamu.backend.service;

import java.util.List;
import java.util.Optional;

import com.yamu.backend.dto.LocationCreateRequest;
import com.yamu.backend.dto.LocationUpdateRequest;
import com.yamu.backend.model.Location;
import com.yamu.backend.repository.LocationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    @Autowired
    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location getLocationById(long id) {
        Optional<Location> optLocation = locationRepository.findById(id);
        if (optLocation.isEmpty()) {
            throw new RuntimeException("Location not found");
        }
        Location location = optLocation.get();
        return location;
    }

    @Transactional
    public void deleteLocation(long id) {
        Optional<Location> optLocation = locationRepository.findById(id);
        if (optLocation.isEmpty()) {
            throw new RuntimeException("Location not found");
        }

        locationRepository.delete(optLocation.get());
    }

    public void updateLocation(long id, LocationUpdateRequest updateRequest) {
        Optional<Location> optLocation = locationRepository.findById(id);
        if (optLocation.isEmpty()) {
            throw new RuntimeException("Location not found");
        }
        Location location = optLocation.get();
        if (updateRequest.getName() != null) {
            location.setName(updateRequest.getName());
        }
        updateRequest.getLongitude().ifPresent(location::setLongitude);
        updateRequest.getLatitude().ifPresent(location::setLatitude);
        locationRepository.save(location);
    }

    public void addLocation(LocationCreateRequest createRequest) {
        
            Location location = new Location();
            location.setName(createRequest.getName());
            location.setLongitude(createRequest.getLongitude());
            location.setLatitude(createRequest.getLatitude());
            locationRepository.save(location);
        
    }
}