package com.yamu.backend.service;

import java.util.List;
import java.util.Optional;
import com.yamu.backend.dto.LocationCreateRequest;
import com.yamu.backend.dto.LocationUpdateRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yamu.backend.model.Location;
import com.yamu.backend.repository.LocationRepository;



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

    public Optional<Location> getLocationById(long id) {
        Optional<Location> location = locationRepository.findById(id);
        if (location.isEmpty()) {
            throw new RuntimeException("Location not found");
        }
        return location;
    }

    @Transactional
public void deleteLocation(long id) {
    Optional<Location> location = locationRepository.findById(id);
    if (location.isEmpty()) {
        throw new RuntimeException("Location not found");
    }
    locationRepository.deleteById(id);
}

    public void updateLocation(long id, LocationUpdateRequest updateRequest) {
        Optional<Location> location = locationRepository.findById(id);
        if (location.isEmpty()) {
            throw new RuntimeException("Location not found");
        }
        Location locationToUpdate = location.get();
        if (updateRequest.getName() != null) {
            locationToUpdate.setName(updateRequest.getName());
        }
        updateRequest.getLongitude().ifPresent(locationToUpdate::setLongitude);
        updateRequest.getLatitude().ifPresent(locationToUpdate::setLatitude);
        locationRepository.save(locationToUpdate);
    }

    public void addLocation(List<LocationCreateRequest> createRequests) {
        for (LocationCreateRequest createRequest : createRequests) {
            Location location = new Location();
            location.setName(createRequest.getName());
            location.setLongitude(createRequest.getLongitude());
            location.setLatitude(createRequest.getLatitude());
            locationRepository.save(location);
        }
       
    }
}