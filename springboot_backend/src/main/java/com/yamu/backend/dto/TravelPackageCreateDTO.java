package com.yamu.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class TravelPackageCreateDTO {
    
    private String name;
    private String description;
    private String mainAttraction;
    private Integer durationDays;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private BigDecimal hotelCost;
    private BigDecimal guideCost;
    private BigDecimal transportCost;
    private BigDecimal attractionCost;
    
    private Long assignedGuideId;
    private Long assignedDriverId;
    private Long assignedHotelId;
    
    private Integer maxTravelers;
    private String imageUrl;
    private String category; // Will be converted to enum
    
    private List<AttractionDTO> attractions;
    
    @Data
    public static class AttractionDTO {
        private String attractionName;
        private String description;
        private Double latitude;
        private Double longitude;
        private String address;
        private Integer visitOrder;
        private BigDecimal entranceFee;
        private String imageUrl;
        private String visitingTips;
        private Boolean isMainAttraction;
    }
} 