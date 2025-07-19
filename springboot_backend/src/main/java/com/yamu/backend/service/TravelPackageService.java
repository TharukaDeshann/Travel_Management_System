package com.yamu.backend.service;

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
import java.math.RoundingMode;
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
    private final TravelerRepository travelerRepository;
    private final ModelMapper modelMapper;
    
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
        
        // Create travel package
        TravelPackage travelPackage = new TravelPackage();
        travelPackage.setPackageName(request.getPackageName());
        travelPackage.setDescription(request.getDescription());
        travelPackage.setDurationDays(request.getDurationDays());
        travelPackage.setCurrency(request.getCurrency());
        travelPackage.setSelectedHotel(selectedHotel);
        travelPackage.setSelectedVehicle(selectedVehicle);
        travelPackage.setSelectedDriver(selectedDriver);
        travelPackage.setStatus(TravelPackage.PackageStatus.ACTIVE);
        
        // Calculate budget automatically
        BigDecimal calculatedBudget = calculatePackageBudget(request, selectedHotel, selectedVehicle, selectedDriver);
        travelPackage.setBudgetPerPerson(calculatedBudget);
        
        // Save package first to get ID
        travelPackage = travelPackageRepository.save(travelPackage);
        
        // Create day plans
        for (PackageCreateRequestDTO.PackageDayPlanDTO dayPlanDto : request.getDayPlans()) {
            PackageDayPlan dayPlan = new PackageDayPlan();
            dayPlan.setTravelPackage(travelPackage);
            dayPlan.setDayNumber(dayPlanDto.getDayNumber());
            dayPlan.setDayTitle(dayPlanDto.getDayTitle());
            dayPlan.setDescription(dayPlanDto.getDescription());
            dayPlan.setPlannedLocations(dayPlanDto.getPlannedLocations());
            dayPlan.setActivities(dayPlanDto.getActivities());
            dayPlan.setEstimatedCostPerPerson(dayPlanDto.getEstimatedCostPerPerson());
            dayPlan.setTransportationDetails(dayPlanDto.getTransportationDetails());
            dayPlan.setMealPlans(dayPlanDto.getMealPlans());
            dayPlan.setNotes(dayPlanDto.getNotes());
            
            packageDayPlanRepository.save(dayPlan);
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
        
        // Update package details
        existingPackage.setPackageName(request.getPackageName());
        existingPackage.setDescription(request.getDescription());
        existingPackage.setDurationDays(request.getDurationDays());
        existingPackage.setCurrency(request.getCurrency());
        existingPackage.setSelectedHotel(selectedHotel);
        existingPackage.setSelectedVehicle(selectedVehicle);
        existingPackage.setSelectedDriver(selectedDriver);
        
        // Recalculate budget
        BigDecimal calculatedBudget = calculatePackageBudget(request, selectedHotel, selectedVehicle, selectedDriver);
        existingPackage.setBudgetPerPerson(calculatedBudget);
        
        // Update day plans - remove existing and create new ones
        packageDayPlanRepository.deleteAll(existingPackage.getDayPlans());
        existingPackage.getDayPlans().clear();
        
        for (PackageCreateRequestDTO.PackageDayPlanDTO dayPlanDto : request.getDayPlans()) {
            PackageDayPlan dayPlan = new PackageDayPlan();
            dayPlan.setTravelPackage(existingPackage);
            dayPlan.setDayNumber(dayPlanDto.getDayNumber());
            dayPlan.setDayTitle(dayPlanDto.getDayTitle());
            dayPlan.setDescription(dayPlanDto.getDescription());
            dayPlan.setPlannedLocations(dayPlanDto.getPlannedLocations());
            dayPlan.setActivities(dayPlanDto.getActivities());
            dayPlan.setEstimatedCostPerPerson(dayPlanDto.getEstimatedCostPerPerson());
            dayPlan.setTransportationDetails(dayPlanDto.getTransportationDetails());
            dayPlan.setMealPlans(dayPlanDto.getMealPlans());
            dayPlan.setNotes(dayPlanDto.getNotes());
            
            existingPackage.getDayPlans().add(dayPlan);
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
        
        return convertToApplicationResponseDTO(application);
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
     * Calculate package budget automatically
     */
    private BigDecimal calculatePackageBudget(PackageCreateRequestDTO request, Hotel hotel, Vehicle vehicle, Driver driver) {
        BigDecimal totalBudget = BigDecimal.ZERO;
        
        // Hotel cost calculation (per night)
        if (hotel != null) {
            // Use mock pricing based on hotel template or fixed rates
            BigDecimal hotelCostPerNight = getHotelCostPerNight(hotel);
            BigDecimal totalHotelCost = hotelCostPerNight.multiply(BigDecimal.valueOf(request.getDurationDays()));
            totalBudget = totalBudget.add(totalHotelCost);
        }
        
        // Transportation cost calculation
        if (vehicle != null || driver != null) {
            BigDecimal transportCost = getTransportationCost(vehicle, driver, request.getDurationDays());
            totalBudget = totalBudget.add(transportCost);
        }
        
        // Activities and meals cost from day plans
        BigDecimal activitiesCost = request.getDayPlans().stream()
                .map(PackageCreateRequestDTO.PackageDayPlanDTO::getEstimatedCostPerPerson)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        totalBudget = totalBudget.add(activitiesCost);
        
        // Add 10% markup for miscellaneous expenses
        BigDecimal markup = totalBudget.multiply(BigDecimal.valueOf(0.1));
        totalBudget = totalBudget.add(markup);
        
        return totalBudget.setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal getHotelCostPerNight(Hotel hotel) {
        // Mock pricing based on hotel rating and template
        if (hotel.getMockDataTemplate() != null) {
            switch (hotel.getMockDataTemplate()) {
                case LUXURY_RESORT:
                    return BigDecimal.valueOf(350.00);
                case BUSINESS_HOTEL:
                    return BigDecimal.valueOf(220.00);
                case BOUTIQUE_HOTEL:
                    return BigDecimal.valueOf(280.00);
                case BUDGET_INN:
                    return BigDecimal.valueOf(100.00);
                case CITY_CENTER_HOTEL:
                    return BigDecimal.valueOf(250.00);
                default:
                    return BigDecimal.valueOf(200.00);
            }
        }
        
        // Fallback based on rating
        if (hotel.getRating() >= 4.5) {
            return BigDecimal.valueOf(300.00);
        } else if (hotel.getRating() >= 4.0) {
            return BigDecimal.valueOf(200.00);
        } else if (hotel.getRating() >= 3.0) {
            return BigDecimal.valueOf(150.00);
        } else {
            return BigDecimal.valueOf(100.00);
        }
    }
    
    private BigDecimal getTransportationCost(Vehicle vehicle, Driver driver, Integer days) {
        BigDecimal costPerDay = BigDecimal.valueOf(50.00); // Base cost
        
        if (driver != null && driver.getRatePerLng() != null) {
            costPerDay = BigDecimal.valueOf(driver.getRatePerLng()).multiply(BigDecimal.valueOf(100)); // Assuming 100km per day
        } else if (vehicle != null) {
            // Cost based on vehicle type and capacity
            switch (vehicle.getType().toLowerCase()) {
                case "car":
                    costPerDay = BigDecimal.valueOf(50.00);
                    break;
                case "van":
                    costPerDay = BigDecimal.valueOf(80.00);
                    break;
                case "bus":
                    costPerDay = BigDecimal.valueOf(120.00);
                    break;
                case "suv":
                    costPerDay = BigDecimal.valueOf(70.00);
                    break;
                default:
                    costPerDay = BigDecimal.valueOf(60.00);
            }
        }
        
        return costPerDay.multiply(BigDecimal.valueOf(days));
    }
    
    /**
     * Convert entity to response DTO
     */
    private PackageResponseDTO convertToResponseDTO(TravelPackage travelPackage) {
        PackageResponseDTO dto = modelMapper.map(travelPackage, PackageResponseDTO.class);
        
        // Map day plans
        List<PackageResponseDTO.PackageDayPlanResponseDTO> dayPlanDtos = travelPackage.getDayPlans().stream()
                .map(dayPlan -> modelMapper.map(dayPlan, PackageResponseDTO.PackageDayPlanResponseDTO.class))
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
