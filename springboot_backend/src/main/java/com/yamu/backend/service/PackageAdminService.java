package com.yamu.backend.service;

import com.yamu.backend.dto.*;
import com.yamu.backend.model.*;
import com.yamu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PackageAdminService {
    
    private final TravelPackageRepository travelPackageRepository;
    private final PackageApplicationRepository packageApplicationRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    
    /**
     * Get all available hotels for package creation
     */
    @Transactional(readOnly = true)
    public List<HotelResponseDTO> getAvailableHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return hotels.stream()
                .map(this::convertToHotelResponseDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all available vehicles for package creation
     */
    @Transactional(readOnly = true)
    public List<VehicleResponseDTO> getAvailableVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findByAvailableTrue();
        return vehicles.stream()
                .map(this::convertToVehicleResponseDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all available drivers for package creation
     */
    @Transactional(readOnly = true)
    public List<DriverDetailsDTO> getAvailableDrivers() {
        List<Driver> drivers = driverRepository.findAll();
        return drivers.stream()
                .map(DriverDetailsDTO::fromDriver)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all package applications with filtering
     */
    @Transactional(readOnly = true)
    public List<PackageApplicationResponseDTO> getAllApplications(PackageApplication.ApplicationStatus status) {
        List<PackageApplication> applications;
        if (status != null) {
            applications = packageApplicationRepository.findByStatusOrderByAppliedAtDesc(status);
        } else {
            applications = packageApplicationRepository.findAll();
        }
        
        return applications.stream()
                .map(this::convertToApplicationResponseDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Approve/Reject package application
     */
    @Transactional
    public PackageApplicationResponseDTO updateApplicationStatus(
            Long applicationId, 
            PackageApplication.ApplicationStatus status, 
            String adminNotes) {
        
        log.info("Updating application {} to status {}", applicationId, status);
        
        PackageApplication application = packageApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
        
        application.setStatus(status);
        application.setAdminNotes(adminNotes);
        
        if (status == PackageApplication.ApplicationStatus.APPROVED) {
            application.setApprovedAt(LocalDateTime.now());
        }
        
        application = packageApplicationRepository.save(application);
        log.info("Application {} updated successfully", applicationId);
        
        return convertToApplicationResponseDTO(application);
    }
    
    /**
     * Get package statistics for admin dashboard
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPackageStatistics() {
        List<TravelPackage> allPackages = travelPackageRepository.findAll();
        List<PackageApplication> allApplications = packageApplicationRepository.findAll();
        
        // Package statistics
        long totalPackages = allPackages.size();
        long activePackages = allPackages.stream()
                .filter(p -> p.getStatus() == TravelPackage.PackageStatus.ACTIVE)
                .count();
        
        // Application statistics
        long totalApplications = allApplications.size();
        long pendingApplications = allApplications.stream()
                .filter(a -> a.getStatus() == PackageApplication.ApplicationStatus.PENDING)
                .count();
        long approvedApplications = allApplications.stream()
                .filter(a -> a.getStatus() == PackageApplication.ApplicationStatus.APPROVED)
                .count();
        
        // Revenue calculation
        BigDecimal totalRevenue = allApplications.stream()
                .filter(a -> a.getStatus() == PackageApplication.ApplicationStatus.APPROVED)
                .map(PackageApplication::getTotalBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Popular packages
        Map<String, Long> popularPackages = allApplications.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getTravelPackage().getPackageName(),
                        Collectors.counting()
                ));
        
        return Map.of(
                "totalPackages", totalPackages,
                "activePackages", activePackages,
                "totalApplications", totalApplications,
                "pendingApplications", pendingApplications,
                "approvedApplications", approvedApplications,
                "totalRevenue", totalRevenue,
                "popularPackages", popularPackages
        );
    }
    
    /**
     * Get applications for a specific package
     */
    @Transactional(readOnly = true)
    public List<PackageApplicationResponseDTO> getPackageApplications(Long packageId) {
        TravelPackage travelPackage = travelPackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + packageId));
        
        return packageApplicationRepository.findByTravelPackageOrderByAppliedAtDesc(travelPackage)
                .stream()
                .map(this::convertToApplicationResponseDTO)
                .collect(Collectors.toList());
    }
    
    private HotelResponseDTO convertToHotelResponseDTO(Hotel hotel) {
        HotelResponseDTO dto = new HotelResponseDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setAddress(hotel.getAddress());
        dto.setLatitude(hotel.getLatitude());
        dto.setLongitude(hotel.getLongitude());
        dto.setRating(hotel.getRating());
        dto.setTotalRatings(hotel.getTotalRatings());
        dto.setPriceLevel(hotel.getPriceLevel());
        dto.setGooglePlaceId(hotel.getGooglePlaceId());
        dto.setPhoneNumber(hotel.getPhoneNumber());
        dto.setWebsiteUrl(hotel.getWebsiteUrl());
        dto.setMockDataTemplate(hotel.getMockDataTemplate());
        return dto;
    }
    
    private VehicleResponseDTO convertToVehicleResponseDTO(Vehicle vehicle) {
        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(vehicle.getId());
        dto.setGuideId(vehicle.getGuide().getId());
        dto.setType(vehicle.getType());
        dto.setModel(vehicle.getModel());
        dto.setCapacity(vehicle.getCapacity());
        dto.setAirConditioned(vehicle.isAirConditioned());
        dto.setAvailable(vehicle.isAvailable());
        dto.setVehicleImageUrl(vehicle.getVehicleImageUrl());
        return dto;
    }
    
    private PackageApplicationResponseDTO convertToApplicationResponseDTO(PackageApplication application) {
        PackageApplicationResponseDTO dto = new PackageApplicationResponseDTO();
        dto.setId(application.getId());
        dto.setStartingDate(application.getStartingDate());
        dto.setGroupMemberCount(application.getGroupMemberCount());
        dto.setTotalBudget(application.getTotalBudget());
        dto.setStatus(application.getStatus().name());
        dto.setSpecialRequests(application.getSpecialRequests());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setApprovedAt(application.getApprovedAt());
        dto.setAdminNotes(application.getAdminNotes());
        
        // Map traveler details
        PackageApplicationResponseDTO.TravelerResponseDTO travelerDto = new PackageApplicationResponseDTO.TravelerResponseDTO();
        travelerDto.setId(application.getTraveler().getId());
        travelerDto.setFirstName(application.getTraveler().getFirstName());
        travelerDto.setLastName(application.getTraveler().getLastName());
        travelerDto.setEmail(application.getTraveler().getEmail());
        travelerDto.setNationality(application.getTraveler().getNationality());
        travelerDto.setPhoneNumber(application.getTraveler().getContactNumber());
        dto.setTraveler(travelerDto);
        
        // Map package details - simplified version
        PackageResponseDTO packageDto = new PackageResponseDTO();
        packageDto.setId(application.getTravelPackage().getId());
        packageDto.setPackageName(application.getTravelPackage().getPackageName());
        packageDto.setDescription(application.getTravelPackage().getDescription());
        packageDto.setDurationDays(application.getTravelPackage().getDurationDays());
        packageDto.setBudgetPerPerson(application.getTravelPackage().getBudgetPerPerson());
        packageDto.setCurrency(application.getTravelPackage().getCurrency());
        packageDto.setStatus(application.getTravelPackage().getStatus().name());
        dto.setTravelPackage(packageDto);
        
        return dto;
    }
}
