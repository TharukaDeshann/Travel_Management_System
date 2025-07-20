package com.yamu.backend.dto;

import com.yamu.backend.model.PaymentInfo;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelBookingRequestDTO {
    
    @NotNull(message = "Hotel ID is required")
    private Long hotelId;
    
    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date must be today or in the future")
    private LocalDate checkInDate;
    
    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    private LocalDate checkOutDate;
    
    @NotNull(message = "Room type is required")
    @NotBlank(message = "Room type cannot be blank")
    private String roomType;
    
    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "At least 1 room must be booked")
    @Max(value = 10, message = "Maximum 10 rooms can be booked at once")
    private Integer numberOfRooms;
    
    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "At least 1 guest is required")
    @Max(value = 20, message = "Maximum 20 guests allowed")
    private Integer numberOfGuests;
    
    @Size(max = 500, message = "Special requests cannot exceed 500 characters")
    private String specialRequests;
    
    // Guest information
    @NotBlank(message = "Guest name is required")
    @Size(max = 100, message = "Guest name cannot exceed 100 characters")
    private String guestName;
    
    @NotBlank(message = "Guest email is required")
    @Email(message = "Invalid email format")
    private String guestEmail;
    
    @NotBlank(message = "Guest phone is required")
    @Size(max = 20, message = "Guest phone cannot exceed 20 characters")
    private String guestPhone;
    
    // Pricing information
    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.01", message = "Price per night must be greater than 0")
    private BigDecimal pricePerNight;
    
    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.01", message = "Total price must be greater than 0")
    private BigDecimal totalPrice;
    
    // Payment information
    @NotNull(message = "Payment method is required")
    private PaymentInfo.PaymentMethod paymentMethod;
    
    @NotBlank(message = "Cardholder name is required")
    @Size(max = 100, message = "Cardholder name cannot exceed 100 characters")
    private String cardholderName;
    
    @Pattern(regexp = "\\d{4}", message = "Card last four must be 4 digits")
    private String cardLastFour;
    
    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than 0")
    private BigDecimal paymentAmount;
    
    @NotBlank(message = "Currency code is required")
    @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
    private String currencyCode;

    private Long dayPlanId;
}
