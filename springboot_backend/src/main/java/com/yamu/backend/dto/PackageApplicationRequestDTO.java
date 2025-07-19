package com.yamu.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageApplicationRequestDTO {
    
    @NotNull(message = "Package ID is required")
    private Long packageId;
    
    @NotNull(message = "Starting date is required")
    @FutureOrPresent(message = "Starting date must be today or in the future")
    private LocalDate startingDate;
    
    @NotNull(message = "Group member count is required")
    @Min(value = 1, message = "Group must have at least 1 member")
    @Max(value = 20, message = "Group cannot exceed 20 members")
    private Integer groupMemberCount;
    
    @Size(max = 1000, message = "Special requests cannot exceed 1000 characters")
    private String specialRequests;
}
