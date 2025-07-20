package com.yamu.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yamu.backend.dto.*;
import com.yamu.backend.exception.ResourceNotFoundException;
import com.yamu.backend.model.*;
import com.yamu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelPackageService {
    
    private final TravelPackageRepository travelPackageRepository;
    private final PackageApplicationRepository packageApplicationRepository;
    private final PackageDayPlanRepository packageDayPlanRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final GuideRepository guideRepository;
    private final TravelerRepository travelerRepository;
    
    // New repositories for traveler itinerary creation
    private final ItineraryRepository itineraryRepository;
    private final DayPlanRepository dayPlanRepository;
    private final LocationRepository locationRepository;
    private final RouteRepository routeRepository;
    private final HotelBookingRepository hotelBookingRepository;
    private final DriverBookingRepository driverBookingRepository;
    private final GuideReservationRepository guideReservationRepository;
    
    private final ModelMapper modelMapper;
    private final ObjectMapper objectMapper;
    
    /**
     * Create a new travel package (Admin only)
     */
    @Transactional
    public PackageResponseDTO createPackage(PackageCreateRequestDTO request) {
        log.info("Creating travel package: {}", request.getPackageName());
        
        // Validate selected resources
        Hotel selectedHotel = null;
        if (request.getSelectedHotelId() != null) {
            selectedHotel = hotelRepository.findById(request.getSelectedHotelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getSelectedHotelId()));
        }
        
        Vehicle selectedVehicle = null;
        if (request.getSelectedVehicleId() != null) {
            selectedVehicle = vehicleRepository.findById(request.getSelectedVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getSelectedVehicleId()));
        }
        
        Driver selectedDriver = null;
        if (request.getSelectedDriverId() != null) {
            selectedDriver = driverRepository.findById(request.getSelectedDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + request.getSelectedDriverId()));
        }
        
        Guide selectedGuide = null;
        if (request.getSelectedGuideId() != null) {
            selectedGuide = guideRepository.findById(request.getSelectedGuideId())
                    .orElseThrow(() -> new ResourceNotFoundException("Guide not found with id: " + request.getSelectedGuideId()));
        }
        
        // Create travel package
        TravelPackage travelPackage = new TravelPackage();
        travelPackage.setPackageName(request.getPackageName());
        travelPackage.setDescription(request.getDescription());
        travelPackage.setDurationDays(request.getDurationDays());
        travelPackage.setCurrency(request.getCurrency());
        travelPackage.setSelectedHotel(selectedHotel);
        travelPackage.setSelectedVehicle(selectedVehicle);
        travelPackage.setSelectedDriver(selectedDriver);
        travelPackage.setSelectedGuide(selectedGuide);
        
        // Set status from request or default to DRAFT
        TravelPackage.PackageStatus status = TravelPackage.PackageStatus.DRAFT;
        if (request.getStatus() != null) {
            try {
                status = TravelPackage.PackageStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                // If invalid status provided, default to DRAFT
                log.warn("Invalid status provided: {}, defaulting to DRAFT", request.getStatus());
            }
        }
        travelPackage.setStatus(status);
        
        // Use the budget provided by admin
        travelPackage.setBudgetPerPerson(request.getBudgetPerPerson());
        
        // Save package first to get ID
        travelPackage = travelPackageRepository.save(travelPackage);
        
        // Create day plans
        for (PackageCreateRequestDTO.PackageDayPlanDTO dayPlanDto : request.getDayPlans()) {
            PackageDayPlan dayPlan = new PackageDayPlan();
            dayPlan.setTravelPackage(travelPackage);
            dayPlan.setDayNumber(dayPlanDto.getDayNumber());
            
            // Use dayTitle if provided, otherwise generate default
            String dayTitle = dayPlanDto.getDayTitle();
            if (dayTitle == null || dayTitle.trim().isEmpty()) {
                dayTitle = "Day " + dayPlanDto.getDayNumber();
            }
            dayPlan.setDayTitle(dayTitle);
            
            dayPlan.setDescription(dayPlanDto.getDescription());
            
            // Convert List<String> to JSON string for plannedLocations
            try {
                String locationsJson = objectMapper.writeValueAsString(dayPlanDto.getPlannedLocations());
                dayPlan.setPlannedLocations(locationsJson);
            } catch (JsonProcessingException e) {
                log.error("Error converting planned locations to JSON", e);
                dayPlan.setPlannedLocations("[]");
            }
            
            // Convert List<String> to JSON string for activities
            try {
                String activitiesJson = objectMapper.writeValueAsString(dayPlanDto.getPlannedActivities());
                dayPlan.setActivities(activitiesJson);
            } catch (JsonProcessingException e) {
                log.error("Error converting planned activities to JSON", e);
                dayPlan.setActivities("[]");
            }
            
            dayPlan.setEstimatedCostPerPerson(dayPlanDto.getEstimatedCostPerPerson());
            dayPlan.setTransportationDetails(dayPlanDto.getTransportationDetails());
            dayPlan.setMealPlans(dayPlanDto.getMealPlans());
            dayPlan.setNotes(dayPlanDto.getNotes());
            
            // Save the day plan first to get the ID
            PackageDayPlan savedDayPlan = packageDayPlanRepository.save(dayPlan);
            
            // Handle package route if provided
            PackageDayPlanRoute packageRoute = null;
            if (dayPlanDto.getPackageRoute() != null) {
                PackageRouteCreateRequest routeRequest = dayPlanDto.getPackageRoute();
                packageRoute = new PackageDayPlanRoute();
                packageRoute.setPackageDayPlan(savedDayPlan);
                packageRoute.setName(routeRequest.getName());
                packageRoute.setTravelMode(routeRequest.getTravelMode());
                packageRoute.setTotalDistance(routeRequest.getTotalDistance());
                packageRoute.setEstimatedTime(routeRequest.getEstimatedTime());
                
                savedDayPlan.setPackageRoute(packageRoute);
                log.info("Created route for day plan {}: {}", savedDayPlan.getId(), packageRoute.getName());
            }
            
            // Handle package locations if provided
            if (dayPlanDto.getPackageLocations() != null && !dayPlanDto.getPackageLocations().isEmpty()) {
                log.info("Processing {} locations for day plan {}", dayPlanDto.getPackageLocations().size(), savedDayPlan.getId());
                for (PackageLocationCreateRequest locationRequest : dayPlanDto.getPackageLocations()) {
                    PackageDayPlanLocation packageLocation = new PackageDayPlanLocation();
                    packageLocation.setPackageDayPlan(savedDayPlan);
                    packageLocation.setPackageDayPlanRoute(packageRoute); // Link to route if exists
                    packageLocation.setName(locationRequest.getName());
                    packageLocation.setAddress(locationRequest.getAddress());
                    packageLocation.setLatitude(locationRequest.getLatitude());
                    packageLocation.setLongitude(locationRequest.getLongitude());
                    packageLocation.setPositionIndex(locationRequest.getPositionIndex());
                    packageLocation.setPlaceId(locationRequest.getPlaceId());
                    packageLocation.setNotes(locationRequest.getNotes());
                    
                    savedDayPlan.getPackageLocations().add(packageLocation);
                    log.info("Added location: {} at position {}", packageLocation.getName(), packageLocation.getPositionIndex());
                }
            } else {
                log.info("No package locations provided for day plan {}", savedDayPlan.getId());
            }
        }
        
        log.info("Travel package created successfully with ID: {}", travelPackage.getId());
        return convertToResponseDTO(travelPackage);
    }
    
    /**
     * Get all packages (with filtering options)
     */
    @Transactional(readOnly = true)
    public List<PackageResponseDTO> getAllPackages(TravelPackage.PackageStatus status) {
        List<TravelPackage> packages;
        if (status != null) {
            packages = travelPackageRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            packages = travelPackageRepository.findAllByOrderByCreatedAtDesc();
        }
        
        return packages.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get package by ID with full details
     */
    @Transactional(readOnly = true)
    public PackageResponseDTO getPackageById(Long packageId) {
        TravelPackage travelPackage = travelPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel package not found with id: " + packageId));
        
        return convertToResponseDTO(travelPackage);
    }
    
    /**
     * Update an existing package (Admin only)
     */
    @Transactional
    public PackageResponseDTO updatePackage(Long packageId, PackageCreateRequestDTO request) {
        log.info("Updating travel package with ID: {}", packageId);
        
        TravelPackage existingPackage = travelPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel package not found with id: " + packageId));
        
        // Validate selected resources
        Hotel selectedHotel = null;
        if (request.getSelectedHotelId() != null) {
            selectedHotel = hotelRepository.findById(request.getSelectedHotelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + request.getSelectedHotelId()));
        }
        
        Vehicle selectedVehicle = null;
        if (request.getSelectedVehicleId() != null) {
            selectedVehicle = vehicleRepository.findById(request.getSelectedVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getSelectedVehicleId()));
        }
        
        Driver selectedDriver = null;
        if (request.getSelectedDriverId() != null) {
            selectedDriver = driverRepository.findById(request.getSelectedDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + request.getSelectedDriverId()));
        }
        
        Guide selectedGuide = null;
        if (request.getSelectedGuideId() != null) {
            selectedGuide = guideRepository.findById(request.getSelectedGuideId())
                    .orElseThrow(() -> new ResourceNotFoundException("Guide not found with id: " + request.getSelectedGuideId()));
        }
        
        // Update package details
        existingPackage.setPackageName(request.getPackageName());
        existingPackage.setDescription(request.getDescription());
        existingPackage.setDurationDays(request.getDurationDays());
        existingPackage.setCurrency(request.getCurrency());
        existingPackage.setSelectedHotel(selectedHotel);
        existingPackage.setSelectedVehicle(selectedVehicle);
        existingPackage.setSelectedDriver(selectedDriver);
        existingPackage.setSelectedGuide(selectedGuide);
        
        // Update status if provided
        if (request.getStatus() != null) {
            try {
                TravelPackage.PackageStatus status = TravelPackage.PackageStatus.valueOf(request.getStatus().toUpperCase());
                existingPackage.setStatus(status);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status provided during update: {}, keeping existing status", request.getStatus());
            }
        }
        
        // Use the budget provided by admin
        existingPackage.setBudgetPerPerson(request.getBudgetPerPerson());
        
        // Update day plans - remove existing and create new ones
        packageDayPlanRepository.deleteAll(existingPackage.getDayPlans());
        existingPackage.getDayPlans().clear();
        
        for (PackageCreateRequestDTO.PackageDayPlanDTO dayPlanDto : request.getDayPlans()) {
            PackageDayPlan dayPlan = new PackageDayPlan();
            dayPlan.setTravelPackage(existingPackage);
            dayPlan.setDayNumber(dayPlanDto.getDayNumber());
            
            // Use dayTitle if provided, otherwise generate default
            String dayTitle = dayPlanDto.getDayTitle();
            if (dayTitle == null || dayTitle.trim().isEmpty()) {
                dayTitle = "Day " + dayPlanDto.getDayNumber();
            }
            dayPlan.setDayTitle(dayTitle);
            
            dayPlan.setDescription(dayPlanDto.getDescription());
            
            // Convert List<String> to JSON string for plannedLocations
            try {
                String locationsJson = objectMapper.writeValueAsString(dayPlanDto.getPlannedLocations());
                dayPlan.setPlannedLocations(locationsJson);
            } catch (JsonProcessingException e) {
                log.error("Error converting planned locations to JSON", e);
                dayPlan.setPlannedLocations("[]");
            }
            
            // Convert List<String> to JSON string for activities
            try {
                String activitiesJson = objectMapper.writeValueAsString(dayPlanDto.getPlannedActivities());
                dayPlan.setActivities(activitiesJson);
            } catch (JsonProcessingException e) {
                log.error("Error converting planned activities to JSON", e);
                dayPlan.setActivities("[]");
            }
            
            dayPlan.setEstimatedCostPerPerson(dayPlanDto.getEstimatedCostPerPerson());
            dayPlan.setTransportationDetails(dayPlanDto.getTransportationDetails());
            dayPlan.setMealPlans(dayPlanDto.getMealPlans());
            dayPlan.setNotes(dayPlanDto.getNotes());
            
            // Save the day plan first to get the ID
            PackageDayPlan savedDayPlan = packageDayPlanRepository.save(dayPlan);
            
            // Handle package route if provided
            PackageDayPlanRoute packageRoute = null;
            if (dayPlanDto.getPackageRoute() != null) {
                PackageRouteCreateRequest routeRequest = dayPlanDto.getPackageRoute();
                packageRoute = new PackageDayPlanRoute();
                packageRoute.setPackageDayPlan(savedDayPlan);
                packageRoute.setName(routeRequest.getName());
                packageRoute.setTravelMode(routeRequest.getTravelMode());
                packageRoute.setTotalDistance(routeRequest.getTotalDistance());
                packageRoute.setEstimatedTime(routeRequest.getEstimatedTime());
                
                savedDayPlan.setPackageRoute(packageRoute);
                log.info("Updated route for day plan {}: {}", savedDayPlan.getId(), packageRoute.getName());
            }
            
            // Handle package locations if provided
            if (dayPlanDto.getPackageLocations() != null && !dayPlanDto.getPackageLocations().isEmpty()) {
                log.info("Processing {} locations for day plan update {}", dayPlanDto.getPackageLocations().size(), savedDayPlan.getId());
                for (PackageLocationCreateRequest locationRequest : dayPlanDto.getPackageLocations()) {
                    PackageDayPlanLocation packageLocation = new PackageDayPlanLocation();
                    packageLocation.setPackageDayPlan(savedDayPlan);
                    packageLocation.setPackageDayPlanRoute(packageRoute); // Link to route if exists
                    packageLocation.setName(locationRequest.getName());
                    packageLocation.setAddress(locationRequest.getAddress());
                    packageLocation.setLatitude(locationRequest.getLatitude());
                    packageLocation.setLongitude(locationRequest.getLongitude());
                    packageLocation.setPositionIndex(locationRequest.getPositionIndex());
                    packageLocation.setPlaceId(locationRequest.getPlaceId());
                    packageLocation.setNotes(locationRequest.getNotes());
                    
                    savedDayPlan.getPackageLocations().add(packageLocation);
                }
            }
            
            existingPackage.getDayPlans().add(savedDayPlan);
        }
        
        TravelPackage updatedPackage = travelPackageRepository.save(existingPackage);
        log.info("Travel package updated successfully: {}", packageId);
        
        return convertToResponseDTO(updatedPackage);
    }
    
    /**
     * Delete a package (Admin only)
     */
    @Transactional
    public void deletePackage(Long packageId) {
        log.info("Deleting travel package with ID: {}", packageId);
        
        TravelPackage travelPackage = travelPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel package not found with id: " + packageId));
        
        // Check if there are any approved applications
        Long approvedApplications = packageApplicationRepository.countByPackageIdAndStatus(
                packageId, PackageApplication.ApplicationStatus.APPROVED);
        
        if (approvedApplications > 0) {
            throw new IllegalStateException("Cannot delete package with approved applications");
        }
        
        travelPackageRepository.delete(travelPackage);
        log.info("Travel package deleted successfully: {}", packageId);
    }
    
    /**
     * Apply for a package (Traveler)
     */
    @Transactional
    public PackageApplicationResponseDTO applyForPackage(Long travelerId, PackageApplicationRequestDTO request) {
        log.info("Traveler {} applying for package {}", travelerId, request.getPackageId());
        
        Traveler traveler = travelerRepository.findById(travelerId)
                .orElseThrow(() -> new ResourceNotFoundException("Traveler not found with id: " + travelerId));
        
        TravelPackage travelPackage = travelPackageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Travel package not found with id: " + request.getPackageId()));
        
        // Check if traveler has already applied for this package
        packageApplicationRepository.findByTravelerIdAndPackageId(travelerId, request.getPackageId())
                .ifPresent(existingApplication -> {
                    throw new IllegalStateException("You have already applied for this package");
                });
        
        // Calculate total budget for the group
        BigDecimal totalBudget = travelPackage.getBudgetPerPerson()
                .multiply(BigDecimal.valueOf(request.getGroupMemberCount()));
        
        // Create application
        PackageApplication application = new PackageApplication();
        application.setTravelPackage(travelPackage);
        application.setTraveler(traveler);
        application.setStartingDate(request.getStartingDate());
        application.setGroupMemberCount(request.getGroupMemberCount());
        application.setTotalBudget(totalBudget);
        application.setSpecialRequests(request.getSpecialRequests());
        application.setStatus(PackageApplication.ApplicationStatus.PENDING);
        
        application = packageApplicationRepository.save(application);
        log.info("Package application created successfully with ID: {}", application.getId());
        
        // Create itinerary and all associated bookings/reservations
        createItineraryForApplication(traveler, travelPackage, request);
        
        return convertToApplicationResponseDTO(application);
    }
    
    /**
     * Create itinerary and all associated bookings for a package application
     */
    private void createItineraryForApplication(Traveler traveler, TravelPackage travelPackage, PackageApplicationRequestDTO request) {
        log.info("Creating itinerary for traveler {} and package {}", traveler.getId(), travelPackage.getId());
        
        // Create Itinerary
        Itinerary itinerary = new Itinerary();
        itinerary.setBudget(travelPackage.getBudgetPerPerson().doubleValue() * request.getGroupMemberCount());
        itinerary.setCurrency(travelPackage.getCurrency());
        
        // Convert LocalDate to Date
        java.util.Date startDate = java.util.Date.from(request.getStartingDate().atStartOfDay(java.time.ZoneId.systemDefault()).toInstant());
        itinerary.setStartDate(startDate);
        
        // Calculate end date
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        calendar.setTime(startDate);
        calendar.add(java.util.Calendar.DAY_OF_MONTH, travelPackage.getDurationDays() - 1);
        itinerary.setEndDate(calendar.getTime());
        
        itinerary.setTripTitle(travelPackage.getPackageName());
        itinerary.setTraveler(traveler);
        
        itinerary = itineraryRepository.save(itinerary);
        log.info("Created itinerary with ID: {}", itinerary.getId());
        
        // Create Hotel Booking (for entire trip duration)
        if (travelPackage.getSelectedHotel() != null) {
            createHotelBooking(traveler, travelPackage.getSelectedHotel(), request, itinerary);
        }
        
        // Create Driver Booking (for entire trip)
        DriverBooking driverBooking = null;
        if (travelPackage.getSelectedDriver() != null) {
            driverBooking = createDriverBookingForTrip(traveler, travelPackage, request, itinerary);
        }
        
        // Create Day Plans, Locations, Routes, and Guide Reservations
        createDayPlansAndReservations(itinerary, travelPackage, request, driverBooking, traveler);
    }
    
    /**
     * Create hotel booking for the entire trip duration
     */
    private void createHotelBooking(Traveler traveler, Hotel hotel, PackageApplicationRequestDTO request, Itinerary itinerary) {
        HotelBooking hotelBooking = new HotelBooking();
        hotelBooking.setHotel(hotel);
        hotelBooking.setTraveler(traveler);
        hotelBooking.setCheckInDate(request.getStartingDate());
        hotelBooking.setCheckOutDate(itinerary.getEndDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate());
        hotelBooking.setRoomType(HotelBooking.RoomType.SINGLE);
        hotelBooking.setNumberOfRooms(request.getGroupMemberCount()); // One room per person
        hotelBooking.setNumberOfGuests(request.getGroupMemberCount());
        
        // Calculate total price: 1000 per room per day
        long durationDays = java.time.Duration.between(
            hotelBooking.getCheckInDate().atStartOfDay(),
            hotelBooking.getCheckOutDate().atStartOfDay()
        ).toDays();
        if (durationDays == 0) durationDays = 1; // Minimum 1 day
        
        BigDecimal totalPrice = BigDecimal.valueOf(1000)
                .multiply(BigDecimal.valueOf(request.getGroupMemberCount()))
                .multiply(BigDecimal.valueOf(durationDays));
        hotelBooking.setTotalPrice(totalPrice);
        hotelBooking.setBookingStatus(HotelBooking.BookingStatus.PENDING);
        
        hotelBookingRepository.save(hotelBooking);
        log.info("Created hotel booking for {} rooms, {} days, total price: {}", 
                request.getGroupMemberCount(), durationDays, totalPrice);
    }
    
    /**
     * Create driver booking for the entire trip
     */
    private DriverBooking createDriverBookingForTrip(Traveler traveler, TravelPackage travelPackage, 
                                                   PackageApplicationRequestDTO request, Itinerary itinerary) {
        Driver driver = travelPackage.getSelectedDriver();
        
        // For trip-level driver booking, we'll create one entry for the entire trip
        DriverBooking driverBooking = new DriverBooking();
        driverBooking.setDriver(driver);
        driverBooking.setBookingDate(request.getStartingDate());
        driverBooking.setTravelerId(traveler.getId());
        driverBooking.setStatus("BOOKED");
        
        // Calculate total distance and cost from all day plans
        double totalDistance = 0.0;
        for (PackageDayPlan dayPlan : travelPackage.getDayPlans()) {
            if (dayPlan.getPackageRoute() != null && dayPlan.getPackageRoute().getTotalDistance() != null) {
                totalDistance += dayPlan.getPackageRoute().getTotalDistance();
            }
        }
        
        driverBooking.setTravelLength(totalDistance);
        
        // Calculate cost using driver's rate per km
        double totalCost = totalDistance * (driver.getRatePerLng() != null ? driver.getRatePerLng() : 50.0); // Default rate if null
        driverBooking.setTravelCost(totalCost);
        
        driverBooking = driverBookingRepository.save(driverBooking);
        log.info("Created driver booking for {} km, total cost: {}", totalDistance, totalCost);
        
        return driverBooking;
    }
    
    /**
     * Create day plans, locations, routes, and guide reservations
     */
    private void createDayPlansAndReservations(Itinerary itinerary, TravelPackage travelPackage, 
                                             PackageApplicationRequestDTO request, DriverBooking driverBooking, 
                                             Traveler traveler) {
        
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        calendar.setTime(itinerary.getStartDate());
        
        for (PackageDayPlan packageDayPlan : travelPackage.getDayPlans()) {
            java.util.Date currentDate = calendar.getTime();
            
            // Create DayPlan
            DayPlan dayPlan = new DayPlan();
            dayPlan.setItinerary(itinerary);
            dayPlan.setDate(currentDate);
            
            // Copy details from package day plan (simplified for now)
            dayPlan.setHotelDetails(travelPackage.getSelectedHotel() != null ? 
                travelPackage.getSelectedHotel().getName() : "No hotel selected");
            dayPlan.setTransportDetails(travelPackage.getSelectedDriver() != null ? 
                "Driver: " + travelPackage.getSelectedDriver().getName() : "No driver selected");
            dayPlan.setGuideDetails(travelPackage.getSelectedGuide() != null ? 
                "Guide: " + travelPackage.getSelectedGuide().getFirstName() + " " + 
                travelPackage.getSelectedGuide().getLastName() : "No guide selected");
            
            dayPlan = dayPlanRepository.save(dayPlan);
            log.info("Created day plan for day {}, date: {}", packageDayPlan.getDayNumber(), currentDate);
            
            // Create Route if package day plan has a route
            Route route = null;
            if (packageDayPlan.getPackageRoute() != null) {
                route = createRouteFromPackageRoute(dayPlan, packageDayPlan.getPackageRoute());
            }
            
            // Create Locations from package day plan locations
            if (packageDayPlan.getPackageLocations() != null && !packageDayPlan.getPackageLocations().isEmpty()) {
                createLocationsFromPackageLocations(dayPlan, route, packageDayPlan.getPackageLocations());
            }
            
            // Create Guide Reservation for this day
            if (travelPackage.getSelectedGuide() != null) {
                createGuideReservationForDay(traveler, travelPackage.getSelectedGuide(), currentDate, 
                                           packageDayPlan, request.getGroupMemberCount());
            }
            
            // Move to next day
            calendar.add(java.util.Calendar.DAY_OF_MONTH, 1);
        }
    }
    
    /**
     * Create route from package day plan route
     */
    private Route createRouteFromPackageRoute(DayPlan dayPlan, PackageDayPlanRoute packageRoute) {
        Route route = new Route();
        route.setDayPlan(dayPlan);
        route.setName(packageRoute.getName());
        route.setTravelMode(packageRoute.getTravelMode());
        route.setTotalDistance(packageRoute.getTotalDistance());
        route.setEstimatedTime(packageRoute.getEstimatedTime());
        
        route = routeRepository.save(route);
        log.info("Created route: {} for day plan {}", route.getName(), dayPlan.getId());
        
        return route;
    }
    
    /**
     * Create locations from package day plan locations
     */
    private void createLocationsFromPackageLocations(DayPlan dayPlan, Route route, 
                                                   List<PackageDayPlanLocation> packageLocations) {
        for (PackageDayPlanLocation packageLocation : packageLocations) {
            Location location = new Location();
            location.setDayPlan(dayPlan);
            location.setRoute(route); // Link to route if exists
            location.setName(packageLocation.getName());
            location.setAddress(packageLocation.getAddress());
            location.setLatitude(packageLocation.getLatitude());
            location.setLongitude(packageLocation.getLongitude());
            location.setPositionIndex(packageLocation.getPositionIndex());
            location.setPlaceId(packageLocation.getPlaceId());
            location.setNotes(packageLocation.getNotes());
            
            locationRepository.save(location);
            log.info("Created location: {} at position {}", location.getName(), location.getPositionIndex());
        }
    }
    
    /**
     * Create guide reservation for a specific day
     */
    private void createGuideReservationForDay(Traveler traveler, Guide guide, java.util.Date date, 
                                             PackageDayPlan packageDayPlan, int groupSize) {
        GuideReservation guideReservation = new GuideReservation();
        guideReservation.setUser(traveler); // Traveler extends User
        guideReservation.setDate(date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate());
        guideReservation.setType(GuideReservation.ReservationType.TOUR);
        guideReservation.setTravelerName(traveler.getFirstName() + " " + traveler.getLastName());
        
        // Set place as the first location of the day plan
        String place = "Tour locations";
        if (packageDayPlan.getPackageLocations() != null && !packageDayPlan.getPackageLocations().isEmpty()) {
            place = packageDayPlan.getPackageLocations().get(0).getName();
        }
        guideReservation.setPlace(place);
        guideReservation.setTimePeriod("Full Day Tour");
        
        guideReservationRepository.save(guideReservation);
        log.info("Created guide reservation for {} on date: {}, place: {}", 
                traveler.getFirstName(), date, place);
    }
    
    /**
     * Get traveler's applications
     */
    @Transactional(readOnly = true)
    public List<PackageApplicationResponseDTO> getTravelerApplications(Long travelerId) {
        return packageApplicationRepository.findByTravelerIdOrderByAppliedAtDesc(travelerId)
                .stream()
                .map(this::convertToApplicationResponseDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert entity to response DTO
     */
    private PackageResponseDTO convertToResponseDTO(TravelPackage travelPackage) {
        PackageResponseDTO dto = modelMapper.map(travelPackage, PackageResponseDTO.class);
        
        // Manually map guide details if present
        if (travelPackage.getSelectedGuide() != null) {
            dto.setSelectedGuide(GuideDetailsDTO.fromGuide(travelPackage.getSelectedGuide()));
        }
        
        // Map day plans with route and location details
        List<PackageResponseDTO.PackageDayPlanResponseDTO> dayPlanDtos = travelPackage.getDayPlans().stream()
                .map(dayPlan -> {
                    PackageResponseDTO.PackageDayPlanResponseDTO dayPlanDto = modelMapper.map(dayPlan, PackageResponseDTO.PackageDayPlanResponseDTO.class);
                    
                    // Map package route if exists
                    if (dayPlan.getPackageRoute() != null) {
                        PackageDayPlanRoute route = dayPlan.getPackageRoute();
                        PackageRouteResponseDTO routeDto = new PackageRouteResponseDTO();
                        routeDto.setId(route.getId());
                        routeDto.setName(route.getName());
                        routeDto.setTravelMode(route.getTravelMode());
                        routeDto.setTotalDistance(route.getTotalDistance());
                        routeDto.setEstimatedTime(route.getEstimatedTime());
                        routeDto.setCreatedAt(route.getCreatedAt());
                        routeDto.setUpdatedAt(route.getUpdatedAt());
                        
                        dayPlanDto.setPackageRoute(routeDto);
                    }
                    
                    // Map package locations if exist
                    if (dayPlan.getPackageLocations() != null && !dayPlan.getPackageLocations().isEmpty()) {
                        List<PackageLocationResponseDTO> locationDtos = dayPlan.getPackageLocations().stream()
                                .map(location -> {
                                    PackageLocationResponseDTO locationDto = new PackageLocationResponseDTO();
                                    locationDto.setId(location.getId());
                                    locationDto.setName(location.getName());
                                    locationDto.setAddress(location.getAddress());
                                    locationDto.setLatitude(location.getLatitude());
                                    locationDto.setLongitude(location.getLongitude());
                                    locationDto.setPositionIndex(location.getPositionIndex());
                                    locationDto.setPlaceId(location.getPlaceId());
                                    locationDto.setNotes(location.getNotes());
                                    return locationDto;
                                })
                                .collect(Collectors.toList());
                        
                        dayPlanDto.setPackageLocations(locationDtos);
                        
                        // Also set locations in route if route exists
                        if (dayPlanDto.getPackageRoute() != null) {
                            dayPlanDto.getPackageRoute().setLocations(locationDtos);
                        }
                    }
                    
                    return dayPlanDto;
                })
                .collect(Collectors.toList());
        dto.setDayPlans(dayPlanDtos);
        
        // Create budget breakdown
        PackageResponseDTO.PackageBudgetBreakdownDTO budgetBreakdown = createBudgetBreakdown(travelPackage);
        dto.setBudgetBreakdown(budgetBreakdown);
        
        return dto;
    }
    
    private PackageResponseDTO.PackageBudgetBreakdownDTO createBudgetBreakdown(TravelPackage travelPackage) {
        PackageResponseDTO.PackageBudgetBreakdownDTO breakdown = new PackageResponseDTO.PackageBudgetBreakdownDTO();
        
        // Calculate breakdown based on total budget
        BigDecimal totalBudget = travelPackage.getBudgetPerPerson();
        
        // Rough breakdown percentages
        breakdown.setHotelCostPerPerson(totalBudget.multiply(BigDecimal.valueOf(0.40))); // 40%
        breakdown.setTransportationCostPerPerson(totalBudget.multiply(BigDecimal.valueOf(0.25))); // 25%
        breakdown.setActivitiesCostPerPerson(totalBudget.multiply(BigDecimal.valueOf(0.20))); // 20%
        breakdown.setMealsCostPerPerson(totalBudget.multiply(BigDecimal.valueOf(0.10))); // 10%
        breakdown.setMiscellaneousCostPerPerson(totalBudget.multiply(BigDecimal.valueOf(0.05))); // 5%
        breakdown.setTotalCostPerPerson(totalBudget);
        
        return breakdown;
    }
    
    private PackageApplicationResponseDTO convertToApplicationResponseDTO(PackageApplication application) {
        PackageApplicationResponseDTO dto = modelMapper.map(application, PackageApplicationResponseDTO.class);
        
        // Map traveler details
        PackageApplicationResponseDTO.TravelerResponseDTO travelerDto = new PackageApplicationResponseDTO.TravelerResponseDTO();
        travelerDto.setId(application.getTraveler().getId());
        travelerDto.setFirstName(application.getTraveler().getFirstName());
        travelerDto.setLastName(application.getTraveler().getLastName());
        travelerDto.setEmail(application.getTraveler().getEmail());
        travelerDto.setNationality(application.getTraveler().getNationality());
        travelerDto.setPhoneNumber(application.getTraveler().getContactNumber());
        dto.setTraveler(travelerDto);
        
        return dto;
    }
}
