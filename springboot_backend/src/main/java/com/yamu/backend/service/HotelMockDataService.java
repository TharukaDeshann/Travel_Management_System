package com.yamu.backend.service;

import com.yamu.backend.dto.RoomAvailabilityDTO;
import com.yamu.backend.model.Hotel;
import com.yamu.backend.model.HotelBooking;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class HotelMockDataService {
    
    private final Random random = new Random();
    
    public RoomAvailabilityDTO generateMockRoomData(Hotel.MockDataTemplate template, 
                                                   LocalDate checkIn, 
                                                   LocalDate checkOut) {
        
        return switch (template) {
            case LUXURY_RESORT -> generateLuxuryResortData(checkIn, checkOut);
            case BUSINESS_HOTEL -> generateBusinessHotelData(checkIn, checkOut);
            case BOUTIQUE_HOTEL -> generateBoutiqueHotelData(checkIn, checkOut);
            case BUDGET_INN -> generateBudgetInnData(checkIn, checkOut);
            case CITY_CENTER_HOTEL -> generateCityCenterHotelData(checkIn, checkOut);
        };
    }
    
    public List<String> generateMockAmenities(Hotel.MockDataTemplate template) {
        return switch (template) {
            case LUXURY_RESORT -> Arrays.asList(
                "Swimming Pool", "Spa & Wellness Center", "Fine Dining Restaurant", 
                "Beach Access", "Golf Course", "Concierge Service", "Valet Parking", 
                "Fitness Center", "Tennis Court", "Room Service 24/7"
            );
            case BUSINESS_HOTEL -> Arrays.asList(
                "Business Center", "Conference Rooms", "High-Speed WiFi", 
                "Airport Shuttle", "Laundry Service", "Fitness Center", 
                "Restaurant", "Bar/Lounge", "Express Check-in/out"
            );
            case BOUTIQUE_HOTEL -> Arrays.asList(
                "Unique Design", "Local Art Gallery", "Rooftop Terrace", 
                "Artisan Restaurant", "Personal Service", "Custom Amenities", 
                "Local Experience Tours", "Luxury Bedding", "Minibar"
            );
            case BUDGET_INN -> Arrays.asList(
                "Free WiFi", "Continental Breakfast", "24-hour Front Desk", 
                "Parking", "Air Conditioning", "TV", "Clean Rooms", "Ice Machine"
            );
            case CITY_CENTER_HOTEL -> Arrays.asList(
                "Prime Location", "City Views", "Restaurant", "Bar", 
                "Fitness Center", "Business Center", "Room Service", 
                "Concierge", "Parking Garage", "Shopping Center Access"
            );
        };
    }
    
    private RoomAvailabilityDTO generateLuxuryResortData(LocalDate checkIn, LocalDate checkOut) {
        List<RoomAvailabilityDTO.RoomTypeInfo> rooms = Arrays.asList(
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.DELUXE,
                "Deluxe Ocean View Room with private balcony and premium amenities",
                new BigDecimal("350.00"),
                random.nextInt(8) + 2,
                2,
                Arrays.asList("Ocean View", "King Bed", "Marble Bathroom", "Mini Bar", "Balcony"),
                Arrays.asList("room1.jpg", "room1_bathroom.jpg", "room1_balcony.jpg"),
                "1 King Bed",
                45,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.SUITE,
                "Presidential Suite with separate living area and panoramic ocean views",
                new BigDecimal("750.00"),
                random.nextInt(3) + 1,
                4,
                Arrays.asList("Ocean View", "Separate Living Room", "Jacuzzi", "Butler Service", "Private Terrace"),
                Arrays.asList("suite1.jpg", "suite1_living.jpg", "suite1_terrace.jpg"),
                "1 King Bed + Sofa Bed",
                85,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.FAMILY_ROOM,
                "Family Resort Room with connecting rooms and kids amenities",
                new BigDecimal("500.00"),
                random.nextInt(5) + 1,
                6,
                Arrays.asList("Connecting Rooms", "Kids Play Area", "Family Bathroom", "Refrigerator"),
                Arrays.asList("family1.jpg", "family1_kids.jpg"),
                "2 Queen Beds",
                60,
                true
            )
        );
        
        return new RoomAvailabilityDTO(rooms, checkIn, checkOut);
    }
    
    private RoomAvailabilityDTO generateBusinessHotelData(LocalDate checkIn, LocalDate checkOut) {
        List<RoomAvailabilityDTO.RoomTypeInfo> rooms = Arrays.asList(
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.SINGLE,
                "Business Single Room with work desk and high-speed internet",
                new BigDecimal("180.00"),
                random.nextInt(15) + 5,
                1,
                Arrays.asList("Work Desk", "Ergonomic Chair", "High-Speed WiFi", "Coffee Machine"),
                Arrays.asList("business_single.jpg", "business_desk.jpg"),
                "1 Queen Bed",
                25,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.DOUBLE,
                "Business Double Room with city views and executive amenities",
                new BigDecimal("220.00"),
                random.nextInt(12) + 3,
                2,
                Arrays.asList("City View", "Work Desk", "Premium Internet", "Executive Lounge Access"),
                Arrays.asList("business_double.jpg", "business_view.jpg"),
                "1 King Bed",
                32,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.SUITE,
                "Executive Suite with meeting area and premium business services",
                new BigDecimal("400.00"),
                random.nextInt(5) + 1,
                3,
                Arrays.asList("Meeting Area", "Premium WiFi", "Printer Access", "Executive Lounge"),
                Arrays.asList("executive_suite.jpg", "meeting_area.jpg"),
                "1 King Bed + Sofa",
                55,
                true
            )
        );
        
        return new RoomAvailabilityDTO(rooms, checkIn, checkOut);
    }
    
    private RoomAvailabilityDTO generateBoutiqueHotelData(LocalDate checkIn, LocalDate checkOut) {
        List<RoomAvailabilityDTO.RoomTypeInfo> rooms = Arrays.asList(
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.DOUBLE,
                "Artistically designed room with local cultural elements",
                new BigDecimal("280.00"),
                random.nextInt(8) + 2,
                2,
                Arrays.asList("Unique Design", "Local Art", "Premium Linens", "Custom Furniture"),
                Arrays.asList("boutique_double.jpg", "boutique_art.jpg"),
                "1 Queen Bed",
                30,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.DELUXE,
                "Designer room with premium amenities and personalized service",
                new BigDecimal("380.00"),
                random.nextInt(6) + 1,
                2,
                Arrays.asList("Designer Furnishing", "Premium Bathroom", "Personal Butler", "Rooftop Access"),
                Arrays.asList("boutique_deluxe.jpg", "boutique_bathroom.jpg"),
                "1 King Bed",
                38,
                true
            )
        );
        
        return new RoomAvailabilityDTO(rooms, checkIn, checkOut);
    }
    
    private RoomAvailabilityDTO generateBudgetInnData(LocalDate checkIn, LocalDate checkOut) {
        List<RoomAvailabilityDTO.RoomTypeInfo> rooms = Arrays.asList(
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.SINGLE,
                "Clean and comfortable single room with basic amenities",
                new BigDecimal("80.00"),
                random.nextInt(20) + 10,
                1,
                Arrays.asList("Free WiFi", "Air Conditioning", "TV", "Private Bathroom"),
                Arrays.asList("budget_single.jpg"),
                "1 Twin Bed",
                18,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.DOUBLE,
                "Affordable double room perfect for couples",
                new BigDecimal("100.00"),
                random.nextInt(15) + 8,
                2,
                Arrays.asList("Free WiFi", "Air Conditioning", "TV", "Mini Fridge"),
                Arrays.asList("budget_double.jpg"),
                "1 Double Bed",
                22,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.TWIN,
                "Twin room with two separate beds",
                new BigDecimal("95.00"),
                random.nextInt(12) + 5,
                2,
                Arrays.asList("Free WiFi", "Air Conditioning", "TV", "Work Desk"),
                Arrays.asList("budget_twin.jpg"),
                "2 Twin Beds",
                20,
                true
            )
        );
        
        return new RoomAvailabilityDTO(rooms, checkIn, checkOut);
    }
    
    private RoomAvailabilityDTO generateCityCenterHotelData(LocalDate checkIn, LocalDate checkOut) {
        List<RoomAvailabilityDTO.RoomTypeInfo> rooms = Arrays.asList(
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.DOUBLE,
                "Modern city room with skyline views",
                new BigDecimal("250.00"),
                random.nextInt(12) + 5,
                2,
                Arrays.asList("City View", "Modern Furnishing", "High-Speed WiFi", "Minibar"),
                Arrays.asList("city_double.jpg", "city_view.jpg"),
                "1 Queen Bed",
                28,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.DELUXE,
                "Deluxe city room with premium location benefits",
                new BigDecimal("320.00"),
                random.nextInt(8) + 3,
                2,
                Arrays.asList("Premium City View", "Luxury Amenities", "Express Service", "Lounge Access"),
                Arrays.asList("city_deluxe.jpg", "city_premium_view.jpg"),
                "1 King Bed",
                35,
                true
            ),
            new RoomAvailabilityDTO.RoomTypeInfo(
                HotelBooking.RoomType.SUITE,
                "Urban suite with panoramic city views and executive privileges",
                new BigDecimal("500.00"),
                random.nextInt(4) + 1,
                4,
                Arrays.asList("Panoramic View", "Separate Living Area", "Executive Privileges", "Premium Service"),
                Arrays.asList("city_suite.jpg", "city_living.jpg", "panoramic_view.jpg"),
                "1 King Bed + Sofa Bed",
                65,
                true
            )
        );
        
        return new RoomAvailabilityDTO(rooms, checkIn, checkOut);
    }
    
    public Hotel.MockDataTemplate getRandomTemplate() {
        Hotel.MockDataTemplate[] templates = Hotel.MockDataTemplate.values();
        return templates[random.nextInt(templates.length)];
    }
}
