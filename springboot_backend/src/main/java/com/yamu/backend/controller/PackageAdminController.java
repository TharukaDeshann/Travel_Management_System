package com.yamu.backend.controller;

import com.yamu.backend.dto.*;
import com.yamu.backend.model.PackageApplication;
import com.yamu.backend.service.PackageAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class PackageAdminController {
    
    private final PackageAdminService packageAdminService;
    
    /**
     * Get all available hotels for package creation
     */
    @GetMapping("/resources/hotels")
    public ResponseEntity<List<HotelResponseDTO>> getAvailableHotels() {
        try {
            List<HotelResponseDTO> hotels = packageAdminService.getAvailableHotels();
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            log.error("Error getting available hotels: ", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get all available vehicles for package creation
     */
    @GetMapping("/resources/vehicles")
    public ResponseEntity<List<VehicleResponseDTO>> getAvailableVehicles() {
        try {
            List<VehicleResponseDTO> vehicles = packageAdminService.getAvailableVehicles();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            log.error("Error getting available vehicles: ", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get all available drivers for package creation
     */
    @GetMapping("/resources/drivers")
    public ResponseEntity<List<DriverDetailsDTO>> getAvailableDrivers() {
        try {
            List<DriverDetailsDTO> drivers = packageAdminService.getAvailableDrivers();
            return ResponseEntity.ok(drivers);
        } catch (Exception e) {
            log.error("Error getting available drivers: ", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get all package applications with optional status filter
     */
    @GetMapping("/applications")
    public ResponseEntity<List<PackageApplicationResponseDTO>> getAllApplications(
            @RequestParam(required = false) String status) {
        try {
            PackageApplication.ApplicationStatus applicationStatus = null;
            if (status != null) {
                try {
                    applicationStatus = PackageApplication.ApplicationStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().build();
                }
            }
            
            List<PackageApplicationResponseDTO> applications = packageAdminService.getAllApplications(applicationStatus);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            log.error("Error getting package applications: ", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get applications for a specific package
     */
    @GetMapping("/{packageId}/applications")
    public ResponseEntity<List<PackageApplicationResponseDTO>> getPackageApplications(
            @PathVariable Long packageId) {
        try {
            List<PackageApplicationResponseDTO> applications = packageAdminService.getPackageApplications(packageId);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            log.error("Package not found: {}", packageId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting package applications: ", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Approve or reject a package application
     */
    @PutMapping("/applications/{applicationId}")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            String adminNotes = request.get("adminNotes");
            
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            PackageApplication.ApplicationStatus applicationStatus;
            try {
                applicationStatus = PackageApplication.ApplicationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
            }
            
            PackageApplicationResponseDTO response = packageAdminService.updateApplicationStatus(
                    applicationId, applicationStatus, adminNotes);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Application not found: {}", applicationId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating application status: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    /**
     * Get package management statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPackageStatistics() {
        try {
            Map<String, Object> statistics = packageAdminService.getPackageStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting package statistics: ", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Bulk approve applications
     */
    @PostMapping("/applications/bulk-approve")
    public ResponseEntity<?> bulkApproveApplications(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> applicationIds = (List<Long>) request.get("applicationIds");
            String adminNotes = (String) request.get("adminNotes");
            
            if (applicationIds == null || applicationIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Application IDs are required"));
            }
            
            int approvedCount = 0;
            for (Long applicationId : applicationIds) {
                try {
                    packageAdminService.updateApplicationStatus(
                            applicationId, PackageApplication.ApplicationStatus.APPROVED, adminNotes);
                    approvedCount++;
                } catch (Exception e) {
                    log.error("Failed to approve application {}: ", applicationId, e);
                }
            }
            
            return ResponseEntity.ok(Map.of(
                    "message", "Bulk approval completed",
                    "approvedCount", approvedCount,
                    "totalRequested", applicationIds.size()
            ));
        } catch (Exception e) {
            log.error("Error in bulk approval: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
}
