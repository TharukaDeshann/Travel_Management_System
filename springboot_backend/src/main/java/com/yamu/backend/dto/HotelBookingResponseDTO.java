package com.yamu.backend.dto;

import com.yamu.backend.model.HotelBooking;
import com.yamu.backend.model.PaymentInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelBookingResponseDTO {
    
    private Long id;
    private String bookingReference;
    private HotelResponseDTO hotel;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private HotelBooking.RoomType roomType;
    private Integer numberOfRooms;
    private Integer numberOfGuests;
    private BigDecimal totalPrice;
    private HotelBooking.BookingStatus bookingStatus;
    private String specialRequests;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Payment information (masked for security)
    private PaymentInfo.PaymentMethod paymentMethod;
    private String cardLastFour;
    private String cardholderName;
    private PaymentInfo.PaymentStatus paymentStatus;
    private LocalDateTime paymentTimestamp;
    private String currencyCode;
    private String transactionId;

    private Long dayPlanId;
}
