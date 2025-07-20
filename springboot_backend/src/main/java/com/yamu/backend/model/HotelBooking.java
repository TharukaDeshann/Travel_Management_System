package com.yamu.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "hotel_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelBooking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "booking_reference", unique = true, nullable = false)
    private String bookingReference;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_id", nullable = false)
    private Traveler traveler;
    
    @ManyToOne
    @JoinColumn(name = "day_plan_id")
    private DayPlan dayPlan;
    
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;
    
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    private RoomType roomType;
    
    @Column(name = "number_of_rooms", nullable = false)
    private Integer numberOfRooms;
    
    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;
    
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private BookingStatus bookingStatus;
    
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Fake payment information
    @Embedded
    private PaymentInfo paymentInfo;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        generateBookingReference();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private void generateBookingReference() {
        // Generate a unique booking reference
        this.bookingReference = "HTL" + System.currentTimeMillis() + 
                               String.format("%03d", (int)(Math.random() * 1000));
    }
    
    public enum RoomType {
        SINGLE,
        DOUBLE,
        TWIN,
        DELUXE,
        SUITE,
        FAMILY_ROOM,
        PRESIDENTIAL_SUITE
    }
    
    public enum BookingStatus {
        CONFIRMED,
        PENDING,
        CANCELLED,
        CHECKED_IN,
        CHECKED_OUT,
        NO_SHOW
    }
}
