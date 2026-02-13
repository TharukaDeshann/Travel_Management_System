package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "package_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private TravelPackage travelPackage;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_id", nullable = false)
    private Traveler traveler;
    
    @Column(nullable = false)
    private LocalDate startingDate; // When the traveler wants to start the package
    
    @Column(nullable = false)
    private Integer groupMemberCount; // Number of people in the group
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalBudget; // Total budget calculated for the group
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String specialRequests; // Any special requirements from traveler
    
    @Column(nullable = false)
    private LocalDateTime appliedAt;
    
    @Column
    private LocalDateTime approvedAt;
    
    @Column(columnDefinition = "TEXT")
    private String adminNotes; // Notes from admin when approving/rejecting
    
    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
    }
    
    public enum ApplicationStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }
}
