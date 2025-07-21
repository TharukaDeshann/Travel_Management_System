package com.yamu.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageRouteResponseDTO {
    private Long id;
    private String name;
    private String travelMode;
    private Double totalDistance;
    private Integer estimatedTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PackageLocationResponseDTO> locations;
}
