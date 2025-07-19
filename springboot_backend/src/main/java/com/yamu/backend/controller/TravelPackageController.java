package com.yamu.backend.controller;

import com.yamu.backend.dto.*;
import com.yamu.backend.model.TravelPackage;
import com.yamu.backend.service.TravelPackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TravelPackageController {
    
    private final TravelPackageService travelPackageService;
    
    /**
     * Create a new travel package (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageResponseDTO> createPackage(
            @Valid @RequestBody PackageCreateRequestDTO request) {
        try {
            log.info("Creating new travel package: {}", request.getPackageName());
            PackageResponseDTO response = travelPackageService.createPackage(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error creating travel package: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all travel packages with optional status filter
     */
    @GetMapping
    public ResponseEntity<List<PackageResponseDTO>> getAllPackages(
            @RequestParam(required = false) String status) {
        try {
            TravelPackage.PackageStatus packageStatus = null;
            if (status != null) {
                try {
                    packageStatus = TravelPackage.PackageStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().build();
                }
            }
            
            List<PackageResponseDTO> packages = travelPackageService.getAllPackages(packageStatus);
            return ResponseEntity.ok(packages);
        } catch (Exception e) {
            log.error("Error getting travel packages: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get active packages for travelers
     */
    @GetMapping("/active")
    public ResponseEntity<List<PackageResponseDTO>> getActivePackages() {
        try {
            List<PackageResponseDTO> packages = travelPackageService.getAllPackages(TravelPackage.PackageStatus.ACTIVE);
            return ResponseEntity.ok(packages);
        } catch (Exception e) {
            log.error("Error getting active travel packages: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get package by ID with full details
     */
    @GetMapping("/{packageId}")
    public ResponseEntity<PackageResponseDTO> getPackageById(@PathVariable Long packageId) {
        try {
            PackageResponseDTO packageDto = travelPackageService.getPackageById(packageId);
            return ResponseEntity.ok(packageDto);
        } catch (RuntimeException e) {
            log.error("Package not found: {}", packageId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting package details: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update an existing package (Admin only)
     */
    @PutMapping("/{packageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageResponseDTO> updatePackage(
            @PathVariable Long packageId,
            @Valid @RequestBody PackageCreateRequestDTO request) {
        try {
            log.info("Updating travel package: {}", packageId);
            PackageResponseDTO response = travelPackageService.updatePackage(packageId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Package not found or validation error: {}", packageId, e);
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Error updating travel package: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete a package (Admin only)
     */
    @DeleteMapping("/{packageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePackage(@PathVariable Long packageId) {
        try {
            log.info("Deleting travel package: {}", packageId);
            travelPackageService.deletePackage(packageId);
            return ResponseEntity.ok(Map.of("message", "Package deleted successfully"));
        } catch (IllegalStateException e) {
            log.error("Cannot delete package with approved applications: {}", packageId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Package not found: {}", packageId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting travel package: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    /**
     * Apply for a package (Travelers only)
     */
    @PostMapping("/{packageId}/apply")
    @PreAuthorize("hasRole('TRAVELER')")
    public ResponseEntity<?> applyForPackage(
            @PathVariable Long packageId,
            @Valid @RequestBody PackageApplicationRequestDTO request,
            Principal principal) {
        try {
            // Get traveler ID from authenticated user
            Long travelerId = getUserIdFromPrincipal(principal);
            request.setPackageId(packageId);
            
            log.info("Traveler {} applying for package {}", travelerId, packageId);
            PackageApplicationResponseDTO response = travelPackageService.applyForPackage(travelerId, request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            log.error("Application validation error: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Package or traveler not found: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error applying for package: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    /**
     * Get traveler's package applications
     */
    @GetMapping("/applications/my")
    @PreAuthorize("hasRole('TRAVELER')")
    public ResponseEntity<List<PackageApplicationResponseDTO>> getMyApplications(Principal principal) {
        try {
            Long travelerId = getUserIdFromPrincipal(principal);
            List<PackageApplicationResponseDTO> applications = travelPackageService.getTravelerApplications(travelerId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            log.error("Error getting traveler applications: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get applications for a specific traveler (Admin only)
     */
    @GetMapping("/applications/traveler/{travelerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PackageApplicationResponseDTO>> getTravelerApplications(
            @PathVariable Long travelerId) {
        try {
            List<PackageApplicationResponseDTO> applications = travelPackageService.getTravelerApplications(travelerId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            log.error("Error getting traveler applications: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Calculate budget for custom group size and dates
     */
    @PostMapping("/{packageId}/calculate-budget")
    public ResponseEntity<?> calculateBudget(
            @PathVariable Long packageId,
            @RequestParam Integer groupSize,
            @RequestParam(required = false, defaultValue = "1") Integer extraDays) {
        try {
            PackageResponseDTO packageDto = travelPackageService.getPackageById(packageId);
            
            // Calculate total budget for the group
            PackageResponseDTO.PackageBudgetBreakdownDTO breakdown = packageDto.getBudgetBreakdown();
            java.math.BigDecimal totalForGroup = breakdown.calculateTotalForGroup(groupSize);
            
            // Add extra days if needed
            if (extraDays > 0) {
                java.math.BigDecimal extraCost = breakdown.getHotelCostPerPerson()
                        .add(breakdown.getMealsCostPerPerson())
                        .multiply(java.math.BigDecimal.valueOf(groupSize))
                        .multiply(java.math.BigDecimal.valueOf(extraDays));
                totalForGroup = totalForGroup.add(extraCost);
            }
            
            Map<String, Object> result = Map.of(
                    "packageId", packageId,
                    "groupSize", groupSize,
                    "extraDays", extraDays,
                    "budgetPerPerson", packageDto.getBudgetPerPerson(),
                    "totalBudgetForGroup", totalForGroup,
                    "breakdown", breakdown,
                    "currency", packageDto.getCurrency()
            );
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("Package not found: {}", packageId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error calculating budget: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Helper method to extract user ID from Principal
     * This assumes the Principal.getName() returns the user's email
     * and you have a way to get user ID from email
     */
    private Long getUserIdFromPrincipal(Principal principal) {
        // Implementation depends on your authentication system
        // For now, returning a placeholder - you'll need to implement this
        // based on your UserDetailsService and JWT implementation
        
        // You might need to inject UserService and do:
        // return userService.findByEmail(principal.getName()).getId();
        
        return 1L; // Placeholder - implement based on your auth system
    }
}
