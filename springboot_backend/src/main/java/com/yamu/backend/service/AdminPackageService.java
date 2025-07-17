package com.yamu.backend.service;

import com.yamu.backend.dto.TravelPackageCreateDTO;
import com.yamu.backend.model.*;
import com.yamu.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminPackageService {
    
    @Autowired
    private PackageRepository packageRepository;
    
    @Autowired
    private PackageAttractionRepository packageAttractionRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private GuideRepository guideRepository;
    
    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @Transactional
    public TravelPackage createPackage(TravelPackageCreateDTO dto, Long adminId) {
        // Find the admin
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        // Create the package
        TravelPackage travelPackage = new TravelPackage();
        travelPackage.setName(dto.getName());
        travelPackage.setDescription(dto.getDescription());
        travelPackage.setMainAttraction(dto.getMainAttraction());
        travelPackage.setDurationDays(dto.getDurationDays());
        travelPackage.setStartDate(dto.getStartDate());
        travelPackage.setEndDate(dto.getEndDate());
        travelPackage.setHotelCost(dto.getHotelCost() != null ? dto.getHotelCost() : BigDecimal.ZERO);
        travelPackage.setGuideCost(dto.getGuideCost() != null ? dto.getGuideCost() : BigDecimal.ZERO);
        travelPackage.setTransportCost(dto.getTransportCost() != null ? dto.getTransportCost() : BigDecimal.ZERO);
        travelPackage.setAttractionCost(dto.getAttractionCost() != null ? dto.getAttractionCost() : BigDecimal.ZERO);
        travelPackage.setMaxTravelers(dto.getMaxTravelers());
        travelPackage.setImageUrl(dto.getImageUrl());
        travelPackage.setCreatedBy(admin);
        
        // Calculate total budget
        BigDecimal totalBudget = travelPackage.getHotelCost()
            .add(travelPackage.getGuideCost())
            .add(travelPackage.getTransportCost())
            .add(travelPackage.getAttractionCost());
        travelPackage.setTotalBudget(totalBudget);
        
        // Set category
        if (dto.getCategory() != null) {
            travelPackage.setCategory(TravelPackage.PackageCategory.valueOf(dto.getCategory().toUpperCase()));
        }
        
        // Set assigned resources (optional)
        if (dto.getAssignedGuideId() != null) {
            guideRepository.findById(dto.getAssignedGuideId()).ifPresent(travelPackage::setAssignedGuide);
        }
        
        if (dto.getAssignedDriverId() != null) {
            driverRepository.findById(dto.getAssignedDriverId()).ifPresent(travelPackage::setAssignedDriver);
        }
        
        if (dto.getAssignedHotelId() != null) {
            hotelRepository.findById(dto.getAssignedHotelId()).ifPresent(travelPackage::setAssignedHotel);
        }
        
        // Save the package first
        TravelPackage savedPackage = packageRepository.save(travelPackage);
        
        // Create attractions if provided
        if (dto.getAttractions() != null && !dto.getAttractions().isEmpty()) {
            List<PackageAttraction> attractions = dto.getAttractions().stream()
                .map(attractionDTO -> {
                    PackageAttraction attraction = new PackageAttraction();
                    attraction.setTravelPackage(savedPackage);
                    attraction.setAttractionName(attractionDTO.getAttractionName());
                    attraction.setDescription(attractionDTO.getDescription());
                    attraction.setLatitude(attractionDTO.getLatitude());
                    attraction.setLongitude(attractionDTO.getLongitude());
                    attraction.setAddress(attractionDTO.getAddress());
                    attraction.setVisitOrder(attractionDTO.getVisitOrder());
                    attraction.setEntranceFee(attractionDTO.getEntranceFee() != null ? attractionDTO.getEntranceFee() : BigDecimal.ZERO);
                    attraction.setImageUrl(attractionDTO.getImageUrl());
                    attraction.setVisitingTips(attractionDTO.getVisitingTips());
                    attraction.setIsMainAttraction(attractionDTO.getIsMainAttraction() != null ? attractionDTO.getIsMainAttraction() : false);
                    return attraction;
                })
                .collect(Collectors.toList());
            
            packageAttractionRepository.saveAll(attractions);
        }
        
        return savedPackage;
    }
    
    public List<TravelPackage> getAllPackages() {
        return packageRepository.findAll();
    }
    
    public List<TravelPackage> getActivePackages() {
        return packageRepository.findByIsActiveTrue();
    }
    
    public TravelPackage getPackageById(Long id) {
        return packageRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Package not found"));
    }
    
    @Transactional
    public TravelPackage updatePackage(Long id, TravelPackageCreateDTO dto) {
        TravelPackage existingPackage = getPackageById(id);
        
        existingPackage.setName(dto.getName());
        existingPackage.setDescription(dto.getDescription());
        existingPackage.setMainAttraction(dto.getMainAttraction());
        existingPackage.setDurationDays(dto.getDurationDays());
        existingPackage.setStartDate(dto.getStartDate());
        existingPackage.setEndDate(dto.getEndDate());
        existingPackage.setHotelCost(dto.getHotelCost() != null ? dto.getHotelCost() : BigDecimal.ZERO);
        existingPackage.setGuideCost(dto.getGuideCost() != null ? dto.getGuideCost() : BigDecimal.ZERO);
        existingPackage.setTransportCost(dto.getTransportCost() != null ? dto.getTransportCost() : BigDecimal.ZERO);
        existingPackage.setAttractionCost(dto.getAttractionCost() != null ? dto.getAttractionCost() : BigDecimal.ZERO);
        existingPackage.setMaxTravelers(dto.getMaxTravelers());
        existingPackage.setImageUrl(dto.getImageUrl());
        
        // Recalculate total budget
        BigDecimal totalBudget = existingPackage.getHotelCost()
            .add(existingPackage.getGuideCost())
            .add(existingPackage.getTransportCost())
            .add(existingPackage.getAttractionCost());
        existingPackage.setTotalBudget(totalBudget);
        
        return packageRepository.save(existingPackage);
    }
    
    @Transactional
    public void deletePackage(Long id) {
        TravelPackage travelPackage = getPackageById(id);
        travelPackage.setIsActive(false);
        packageRepository.save(travelPackage);
    }
    
    public List<TravelPackage> searchPackages(String mainAttraction, String category, BigDecimal minBudget, BigDecimal maxBudget) {
        if (mainAttraction != null && !mainAttraction.isEmpty()) {
            return packageRepository.findByMainAttractionContainingIgnoreCase(mainAttraction);
        }
        
        if (category != null && !category.isEmpty()) {
            return packageRepository.findByCategory(TravelPackage.PackageCategory.valueOf(category.toUpperCase()));
        }
        
        if (minBudget != null && maxBudget != null) {
            return packageRepository.findByBudgetRange(minBudget, maxBudget);
        }
        
        return getActivePackages();
    }
} 