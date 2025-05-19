// package com.yamu.backend.service;

// import java.util.List;
// import java.util.Optional;

// import com.yamu.backend.dto.LocationRequest;
// import com.yamu.backend.dto.LocationUpdateRequest;
// import com.yamu.backend.model.DayPlan;
// import com.yamu.backend.model.Location;
// import com.yamu.backend.repository.DayPlanRepository;
// import com.yamu.backend.repository.LocationRepository;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// @Service
// public class LocationService {

//     private final LocationRepository locationRepository;
//     private final DayPlanRepository dayPlanRepository;

//     @Autowired
//     public LocationService(LocationRepository locationRepository, DayPlanRepository dayPlanRepository) {
//         this.dayPlanRepository = dayPlanRepository;
//         this.locationRepository = locationRepository;
//     }

    
//     public List<Location> getAllLocations() {
//         return locationRepository.findAll();
//     }

//     public Location getLocationById(long id) {
//         Optional<Location> optLocation = locationRepository.findById(id);
//         if (optLocation.isEmpty()) {
//             throw new RuntimeException("Location not found");
//         }
//         Location location = optLocation.get();
//         return location;
//     }

//     @Transactional
//     public void deleteLocation(long id) {
//         Optional<Location> optLocation = locationRepository.findById(id);
//         if (optLocation.isEmpty()) {
//             throw new RuntimeException("Location not found");
//         }

//         locationRepository.delete(optLocation.get());
//     }

//     public void updateLocation(long id, LocationUpdateRequest updateRequest) {
//         Optional<Location> optLocation = locationRepository.findById(id);
//         if (optLocation.isEmpty()) {
//             throw new RuntimeException("Location not found");
//         }
//         Location location = optLocation.get();
//         if (updateRequest.getName() != null) {
//             location.setName(updateRequest.getName());
//         }
//         updateRequest.getLongitude().ifPresent(location::setLongitude);
//         updateRequest.getLatitude().ifPresent(location::setLatitude);
//         locationRepository.save(location);
//     }

//     public void addLocation(LocationRequest createRequest) {
//     DayPlan dayPlan = dayPlanRepository.findById(createRequest.getDayPlanId())
//         .orElseThrow(() -> new RuntimeException("DayPlan not found"));

//     Location location = new Location();
//     location.setDayPlan(dayPlan); // 💥 This is what was missing
//     location.setName(createRequest.getName());
//     location.setLatitude(createRequest.getLatitude());
//     location.setLongitude(createRequest.getLongitude());
//     location.setPositionIndex(createRequest.getPositionIndex());
//     location.setAddress(createRequest.getAddress());
//     location.setPlaceId(createRequest.getPlaceId());
//     location.setNotes(createRequest.getNotes());

//     locationRepository.save(location);
// }
// }