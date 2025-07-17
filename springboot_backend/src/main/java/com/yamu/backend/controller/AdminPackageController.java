package com.yamu.backend.controller;

import com.yamu.backend.dto.TravelPackageCreateDTO;
import com.yamu.backend.model.TravelPackage;
import com.yamu.backend.service.AdminPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/packages")
@CrossOrigin(origins = "*")
public class AdminPackageController {
    
    @Autowired
    private AdminPackageService adminPackageService;
    
    @PostMapping
    public ResponseEntity<TravelPackage> createPackage(@RequestBody TravelPackageCreateDTO dto, @RequestParam Long adminId) {
        try {
            TravelPackage createdPackage = adminPackageService.createPackage(dto, adminId);
            return ResponseEntity.ok(createdPackage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<TravelPackage>> getAllPackages() {
        List<TravelPackage> packages = adminPackageService.getAllPackages();
        return ResponseEntity.ok(packages);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<TravelPackage>> getActivePackages() {
        List<TravelPackage> packages = adminPackageService.getActivePackages();
        return ResponseEntity.ok(packages);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TravelPackage> getPackageById(@PathVariable Long id) {
        try {
            TravelPackage travelPackage = adminPackageService.getPackageById(id);
            return ResponseEntity.ok(travelPackage);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TravelPackage> updatePackage(@PathVariable Long id, @RequestBody TravelPackageCreateDTO dto) {
        try {
            TravelPackage updatedPackage = adminPackageService.updatePackage(id, dto);
            return ResponseEntity.ok(updatedPackage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        try {
            adminPackageService.deletePackage(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<TravelPackage>> searchPackages(
            @RequestParam(required = false) String mainAttraction,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget) {
        
        List<TravelPackage> packages = adminPackageService.searchPackages(mainAttraction, category, minBudget, maxBudget);
        return ResponseEntity.ok(packages);
    }
} 