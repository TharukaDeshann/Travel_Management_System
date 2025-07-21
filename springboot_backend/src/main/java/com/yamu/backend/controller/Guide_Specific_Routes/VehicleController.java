package com.yamu.backend.controller.Guide_Specific_Routes;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yamu.backend.dto.VehicleRequestDTO;
import com.yamu.backend.dto.VehicleResponseDTO;
import com.yamu.backend.service.Guide_Specific_Services.VehicleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/guide/vehicles")
@Validated
public class VehicleController {
    private final VehicleService vehicleService;

    @Autowired
    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // Get vehicles by guide ID
    @GetMapping("/{guideId}")
    public ResponseEntity<List<VehicleResponseDTO>> getVehiclesByGuideId(@PathVariable Long guideId) {
        List<VehicleResponseDTO> vehicles = vehicleService.getVehiclesByGuideId(guideId);
        return ResponseEntity.ok(vehicles);
    }

    // Create vehicle for authenticated guide
    @PostMapping
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> addVehicle(@RequestBody @Valid VehicleRequestDTO dto, Principal principal) {

        
        vehicleService.addVehicleForGuide(principal.getName(), dto);
        return ResponseEntity.ok("Vehicle added successfully");
    }

    // Update vehicle
    @PutMapping("/{vehicleId}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> updateVehicle(@PathVariable Long vehicleId,
            @RequestBody @Valid VehicleRequestDTO dto,
            Principal principal) {
        vehicleService.updateVehicle(vehicleId, principal.getName(), dto);
        return ResponseEntity.ok("Vehicle updated successfully");
    }

    // Delete vehicle
    @DeleteMapping("/{vehicleId}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long vehicleId, Principal principal) {
        vehicleService.deleteVehicle(vehicleId, principal.getName());
        return ResponseEntity.ok("Vehicle deleted successfully");
    }

}
