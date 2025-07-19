package com.yamu.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageApplicationResponseDTO {
    
    private Long id;
    private PackageResponseDTO travelPackage;
    private TravelerResponseDTO traveler;
    private LocalDate startingDate;
    private Integer groupMemberCount;
    private BigDecimal totalBudget;
    private String status;
    private String specialRequests;
    private LocalDateTime appliedAt;
    private LocalDateTime approvedAt;
    private String adminNotes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TravelerResponseDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String nationality;
        private String phoneNumber;
    }
}
