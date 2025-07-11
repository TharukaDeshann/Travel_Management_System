package com.yamu.backend.service.Guide_Specific_Services;

import java.util.List;

import com.yamu.backend.dto.VehicleRequestDTO;
import com.yamu.backend.dto.VehicleResponseDTO;
import com.yamu.backend.model.Guide;
import com.yamu.backend.model.Vehicle;
import com.yamu.backend.repository.UserRepository;
import com.yamu.backend.repository.VehicleRepository;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Autowired
    public VehicleService(VehicleRepository vehicleRepository, UserRepository userRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // Map Vehicle to VehicleResponseDTO
    private VehicleResponseDTO mapToVehicleResponseDTO(Vehicle vehicle) {
        VehicleResponseDTO vehicleResponseDTO = new VehicleResponseDTO();
        vehicleResponseDTO.setId(vehicle.getId());
        vehicleResponseDTO.setGuideId(vehicle.getGuide() != null ? vehicle.getGuide().getId() : null); // ✅ Only send ID
        vehicleResponseDTO.setType(vehicle.getType());
        vehicleResponseDTO.setModel(vehicle.getModel());
        vehicleResponseDTO.setCapacity(vehicle.getCapacity());
        vehicleResponseDTO.setAirConditioned(vehicle.isAirConditioned());
        vehicleResponseDTO.setAvailable(vehicle.isAvailable());
        vehicleResponseDTO.setVehicleImageUrl(vehicle.getVehicleImageUrl());
        return vehicleResponseDTO;
    }

    // Get vehicles by guide ID
    public List<VehicleResponseDTO> getVehiclesByGuideId(Long guideId) {
        return vehicleRepository.findByGuideId(guideId)
                .stream()
                .map(this::mapToVehicleResponseDTO)
                .collect(Collectors.toList());
    }

    // Add vehicle for authenticated guide
    public void addVehicleForGuide(String email, VehicleRequestDTO dto) {
        Guide guide = (Guide) userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        Vehicle vehicle = new Vehicle();
        vehicle.setGuide(guide);
        vehicle.setType(dto.getType());
        vehicle.setModel(dto.getModel());
        vehicle.setCapacity(dto.getCapacity());
        vehicle.setAirConditioned(dto.isAirConditioned());
        vehicle.setAvailable(dto.isAvailable());
        vehicle.setVehicleImageUrl(dto.getVehicleImageUrl());

        vehicleRepository.save(vehicle);
    }

    public void updateVehicle(Long vehicleId, String email, VehicleRequestDTO dto) {
        Guide guide = (Guide) userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        Vehicle vehicle = vehicleRepository.findByIdAndGuideId(vehicleId, guide.getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found or not owned by this guide"));

        vehicle.setType(dto.getType());
        vehicle.setModel(dto.getModel());
        vehicle.setCapacity(dto.getCapacity());
        vehicle.setAirConditioned(dto.isAirConditioned());
        vehicle.setAvailable(dto.isAvailable());
        vehicle.setVehicleImageUrl(dto.getVehicleImageUrl());

        vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long vehicleId, String email) {
        Guide guide = (Guide) userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        Vehicle vehicle = vehicleRepository.findByIdAndGuideId(vehicleId, guide.getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found or not owned by this guide"));

        vehicleRepository.delete(vehicle);
    }

}
