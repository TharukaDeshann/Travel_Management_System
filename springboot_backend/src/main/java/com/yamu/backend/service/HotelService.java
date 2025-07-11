package com.yamu.backend.service;

import com.yamu.backend.dto.*;
import com.yamu.backend.model.*;
import com.yamu.backend.repository.HotelBookingRepository;
import com.yamu.backend.repository.HotelRepository;
import com.yamu.backend.repository.TravelerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelService {
    
    private final HotelRepository hotelRepository;
    private final HotelBookingRepository hotelBookingRepository;
    private final TravelerRepository travelerRepository;
    private final HotelMockDataService mockDataService;
    private final OpenStreetMapHotelService openStreetMapHotelService; // Changed from GooglePlacesService
    private final ModelMapper modelMapper;
    
    public List<HotelResponseDTO> searchHotelsAlongRoute(HotelSearchRequestDTO searchRequest) {
        log.info("🔍 HOTEL SEARCH: Route ({}, {}) → ({}, {})",
                searchRequest.getStartLatitude(), searchRequest.getStartLongitude(),
                searchRequest.getEndLatitude(), searchRequest.getEndLongitude());
        
        // Set default values
        Double radius = searchRequest.getRadius() != null ? searchRequest.getRadius() / 1000 : 5.0; // Convert to km
        Double minRating = searchRequest.getMinRating() != null ? searchRequest.getMinRating() : 3.0;
        Integer maxResults = searchRequest.getMaxResults() != null ? searchRequest.getMaxResults() : 10;
        
        log.info("🔍 SEARCH PARAMS: radius={}km, minRating={}, maxResults={}", radius, minRating, maxResults);
        
        // Calculate midpoint for search center
        Double centerLat = (searchRequest.getStartLatitude() + searchRequest.getEndLatitude()) / 2;
        Double centerLng = (searchRequest.getStartLongitude() + searchRequest.getEndLongitude()) / 2;
        
        // First try to get hotels from database (only our seeded/curated hotels)
        List<Hotel> databaseHotels = hotelRepository.findHotelsNearRouteWithFiltersJPQL(
                centerLat, centerLng, radius, minRating, PageRequest.of(0, maxResults));
        
        List<Hotel> allHotels = new ArrayList<>(databaseHotels);
        log.info("📊 DATABASE: Found {} hotels", databaseHotels.size());
        
        // If not enough hotels in database, fetch additional from Google Places API
        // These will be treated as transient data (not saved to database)
        if (allHotels.size() < maxResults) {
            log.info("🗺️ OSM: Searching for additional hotels...");
            List<Hotel> osmHotels = openStreetMapHotelService.searchHotelsAlongRoute(searchRequest);
            log.info("🗺️ OSM: Found {} hotels", osmHotels.size());
            
            // Process OSM hotels as transient data - assign mock templates without saving
            for (Hotel osmHotel : osmHotels) {
                if (allHotels.size() >= maxResults) break;
                
                // Assign random mock data template for this session only
                osmHotel.setMockDataTemplate(mockDataService.getRandomTemplate());
                // Set a temporary ID to distinguish from database hotels
                osmHotel.setId(-Math.abs(osmHotel.getGooglePlaceId().hashCode()) % 100000L);
                
                allHotels.add(osmHotel);
            }
        }
        
        log.info("✅ RESULT: Returning {} total hotels", allHotels.size());
        
        // Convert to DTOs with mock data
        return allHotels.stream()
                .limit(maxResults)
                .map(this::convertToHotelResponseDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<HotelResponseDTO> getHotelDetails(Long hotelId) {
        return hotelRepository.findById(hotelId)
                .map(this::convertToHotelResponseDTO);
    }
    
    public RoomAvailabilityDTO getHotelRoomAvailability(Long hotelId, 
                                                       LocalDate checkIn, 
                                                       LocalDate checkOut) {
        
        // Check if this is an OpenStreetMap hotel (negative ID)
        if (hotelId < 0) {
            log.info("🗺️ OSM Hotel availability request for ID: {}", hotelId);
            // For OSM hotels, generate mock data using a random template
            Hotel.MockDataTemplate template = mockDataService.getRandomTemplate();
            return mockDataService.generateMockRoomData(template, checkIn, checkOut);
        }
        
        // For database hotels, fetch from repository
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with ID: " + hotelId));
        
        return mockDataService.generateMockRoomData(hotel.getMockDataTemplate(), checkIn, checkOut);
    }
    
    @Transactional
    public HotelBookingResponseDTO createBooking(HotelBookingRequestDTO bookingRequest, Long travelerId) {
        log.info("Creating hotel booking for traveler: {}, hotel: {}", travelerId, bookingRequest.getHotelId());
        
        // Validate inputs
        validateBookingRequest(bookingRequest);
        
        // Get or create hotel (handle OSM hotels)
        Hotel hotel = getOrCreateHotel(bookingRequest.getHotelId());
        
        Traveler traveler = travelerRepository.findById(travelerId)
                .orElseThrow(() -> new RuntimeException("Traveler not found"));
        
        // Check room availability (mock validation)
        validateRoomAvailability(hotel, bookingRequest);
        
        // Create booking
        HotelBooking booking = new HotelBooking();
        booking.setHotel(hotel);
        booking.setTraveler(traveler);
        booking.setCheckInDate(bookingRequest.getCheckInDate());
        booking.setCheckOutDate(bookingRequest.getCheckOutDate());
        booking.setRoomType(convertRoomType(bookingRequest.getRoomType()));
        booking.setNumberOfRooms(bookingRequest.getNumberOfRooms());
        booking.setNumberOfGuests(bookingRequest.getNumberOfGuests());
        booking.setTotalPrice(bookingRequest.getPaymentAmount());
        booking.setSpecialRequests(bookingRequest.getSpecialRequests());
        booking.setBookingStatus(HotelBooking.BookingStatus.CONFIRMED);
        
        // Create fake payment info
        PaymentInfo paymentInfo = createFakePaymentInfo(bookingRequest);
        booking.setPaymentInfo(paymentInfo);
        
        // Save booking
        booking = hotelBookingRepository.save(booking);
        
        log.info("Hotel booking created successfully with reference: {}", booking.getBookingReference());
        
        return convertToBookingResponseDTO(booking);
    }
    
    private Hotel getOrCreateHotel(Long hotelId) {
        // For database hotels (positive IDs)
        if (hotelId > 0) {
            return hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
        }
        
        // For OpenStreetMap hotels (negative IDs), check if already exists or create temporary record
        Optional<Hotel> existingHotel = hotelRepository.findById(hotelId);
        if (existingHotel.isPresent()) {
            return existingHotel.get();
        }
        
        // Create a temporary hotel record for OSM hotel
        log.info("🗺️ Creating temporary hotel record for OSM hotel ID: {}", hotelId);
        Hotel osmHotel = new Hotel();
        osmHotel.setId(hotelId);
        osmHotel.setName("OpenStreetMap Hotel #" + Math.abs(hotelId));
        osmHotel.setAddress("Location from OpenStreetMap");
        osmHotel.setLatitude(0.0); // These will be overridden by frontend data
        osmHotel.setLongitude(0.0);
        osmHotel.setRating(4.0);
        osmHotel.setTotalRatings(100);
        osmHotel.setPriceLevel(3);
        osmHotel.setGooglePlaceId("osm_" + Math.abs(hotelId));
        osmHotel.setMockDataTemplate(mockDataService.getRandomTemplate());
        
        // Save temporary hotel record
        return hotelRepository.save(osmHotel);
    }
    
    public List<HotelBookingResponseDTO> getTravelerBookings(Long travelerId) {
        Traveler traveler = travelerRepository.findById(travelerId)
                .orElseThrow(() -> new RuntimeException("Traveler not found"));
        
        return hotelBookingRepository.findByTravelerOrderByCreatedAtDesc(traveler)
                .stream()
                .map(this::convertToBookingResponseDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<HotelBookingResponseDTO> getBookingByReference(String bookingReference) {
        return hotelBookingRepository.findByBookingReference(bookingReference)
                .map(this::convertToBookingResponseDTO);
    }
    
    @Transactional
    public HotelBookingResponseDTO cancelBooking(String bookingReference, Long travelerId) {
        HotelBooking booking = hotelBookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify ownership
        if (!booking.getTraveler().getId().equals(travelerId)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }
        
        // Check if cancellation is allowed (e.g., not within 24 hours of check-in)
        if (booking.getCheckInDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new RuntimeException("Cannot cancel booking within 24 hours of check-in");
        }
        
        booking.setBookingStatus(HotelBooking.BookingStatus.CANCELLED);
        booking.getPaymentInfo().setPaymentStatus(PaymentInfo.PaymentStatus.REFUNDED);
        
        booking = hotelBookingRepository.save(booking);
        
        return convertToBookingResponseDTO(booking);
    }
    
    public List<HotelResponseDTO> getAllHotels() {
        List<Hotel> allHotels = hotelRepository.findAll();
        return allHotels.stream()
                .map(this::convertToHotelResponseDTO)
                .collect(Collectors.toList());
    }
    
    // DEBUG METHODS - Remove in production
    public Map<String, Object> debugDatabaseSearch(Double latitude, Double longitude, Double radiusKm, Double minRating) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        try {
            // Test the exact same query used in search
            List<Hotel> hotels = hotelRepository.findHotelsNearRouteWithFiltersJPQL(
                    latitude, longitude, radiusKm, minRating, PageRequest.of(0, 20));
            
            debugInfo.put("searchParameters", Map.of(
                "latitude", latitude,
                "longitude", longitude,
                "radiusKm", radiusKm,
                "minRating", minRating
            ));
            
            debugInfo.put("hotelsFound", hotels.size());
            debugInfo.put("hotels", hotels.stream().map(hotel -> {
                Map<String, Object> hotelInfo = new HashMap<>();
                hotelInfo.put("id", hotel.getId());
                hotelInfo.put("name", hotel.getName());
                hotelInfo.put("latitude", hotel.getLatitude());
                hotelInfo.put("longitude", hotel.getLongitude());
                hotelInfo.put("rating", hotel.getRating());
                hotelInfo.put("distance", calculateDistance(latitude, longitude, hotel.getLatitude(), hotel.getLongitude()));
                return hotelInfo;
            }).collect(Collectors.toList()));
            
            log.info("🔍 DEBUG DB: Found {} hotels within {}km of ({}, {})", 
                    hotels.size(), radiusKm, latitude, longitude);
            
        } catch (Exception e) {
            log.error("Error in debug database search: ", e);
            debugInfo.put("error", e.getMessage());
        }
        
        return debugInfo;
    }
    
    public Map<String, Object> debugAllHotels() {
        Map<String, Object> debugInfo = new HashMap<>();
        
        try {
            List<Hotel> allHotels = hotelRepository.findAll();
            
            debugInfo.put("totalHotels", allHotels.size());
            debugInfo.put("hotels", allHotels.stream().map(hotel -> {
                Map<String, Object> hotelInfo = new HashMap<>();
                hotelInfo.put("id", hotel.getId());
                hotelInfo.put("name", hotel.getName());
                hotelInfo.put("latitude", hotel.getLatitude());
                hotelInfo.put("longitude", hotel.getLongitude());
                hotelInfo.put("rating", hotel.getRating());
                hotelInfo.put("address", hotel.getAddress() != null ? hotel.getAddress() : "N/A");
                return hotelInfo;
            }).collect(Collectors.toList()));
            
            log.info("🔍 DEBUG: Total {} hotels in database", allHotels.size());
            
        } catch (Exception e) {
            log.error("Error getting all hotels: ", e);
            debugInfo.put("error", e.getMessage());
        }
        
        return debugInfo;
    }
    
    private double calculateDistance(Double lat1, Double lng1, Double lat2, Double lng2) {
        final int EARTH_RADIUS = 6371; // Earth's radius in kilometers
        
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS * c; // Distance in kilometers
    }
    
    private void validateBookingRequest(HotelBookingRequestDTO request) {
        if (request.getCheckInDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Check-in date cannot be in the past");
        }
        
        if (request.getCheckOutDate().isBefore(request.getCheckInDate().plusDays(1))) {
            throw new RuntimeException("Check-out date must be at least one day after check-in");
        }
        
        if (request.getNumberOfGuests() > request.getNumberOfRooms() * 4) {
            throw new RuntimeException("Too many guests for the number of rooms");
        }
    }
    
    private void validateRoomAvailability(Hotel hotel, HotelBookingRequestDTO request) {
        // Generate mock availability based on hotel template
        RoomAvailabilityDTO availability = mockDataService.generateMockRoomData(
                hotel.getMockDataTemplate(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );
        
        // Convert the requested room type string to enum for comparison
        HotelBooking.RoomType requestedRoomType = convertRoomType(request.getRoomType());
        
        // Find the requested room type in availability
        Optional<RoomAvailabilityDTO.RoomTypeInfo> requestedRoom = availability.getAvailableRooms()
                .stream()
                .filter(room -> room.getRoomType() == requestedRoomType)
                .findFirst();
        
        if (requestedRoom.isEmpty()) {
            // Log available room types for debugging
            log.warn("Requested room type '{}' (mapped to {}) not found. Available types: {}", 
                    request.getRoomType(),
                    requestedRoomType,
                    availability.getAvailableRooms().stream()
                            .map(room -> room.getRoomType())
                            .collect(Collectors.toList())
            );
            throw new RuntimeException("Requested room type is not available");
        }
        
        if (requestedRoom.get().getAvailableRooms() < request.getNumberOfRooms()) {
            throw new RuntimeException("Not enough rooms available for the requested dates");
        }
    }
    
    private PaymentInfo createFakePaymentInfo(HotelBookingRequestDTO request) {
        PaymentInfo paymentInfo = new PaymentInfo();
        paymentInfo.setPaymentMethod(request.getPaymentMethod());
        paymentInfo.setCardLastFour(request.getCardLastFour());
        paymentInfo.setCardholderName(request.getCardholderName());
        paymentInfo.setPaymentAmount(request.getPaymentAmount());
        paymentInfo.setTransactionId("TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        paymentInfo.setPaymentStatus(PaymentInfo.PaymentStatus.COMPLETED);
        paymentInfo.setPaymentTimestamp(LocalDateTime.now());
        paymentInfo.setCurrencyCode(request.getCurrencyCode());
        
        return paymentInfo;
    }
    
    private HotelResponseDTO convertToHotelResponseDTO(Hotel hotel) {
        HotelResponseDTO dto = modelMapper.map(hotel, HotelResponseDTO.class);
        
        // Add mock amenities
        dto.setAmenities(mockDataService.generateMockAmenities(hotel.getMockDataTemplate()));
        
        // Generate photo URL if photo reference exists - use placeholder for OSM hotels
        if (hotel.getPhotoReference() != null) {
            try {
                dto.setPhotoUrl("https://via.placeholder.com/400x300/0066cc/ffffff?text=" + 
                              java.net.URLEncoder.encode(hotel.getName(), java.nio.charset.StandardCharsets.UTF_8));
            } catch (Exception e) {
                dto.setPhotoUrl("https://via.placeholder.com/400x300/0066cc/ffffff?text=Hotel+Image");
            }
        } else {
            dto.setPhotoUrl("https://via.placeholder.com/400x300/0066cc/ffffff?text=Hotel+Image");
        }
        
        return dto;
    }
    
    private HotelBookingResponseDTO convertToBookingResponseDTO(HotelBooking booking) {
        HotelBookingResponseDTO dto = modelMapper.map(booking, HotelBookingResponseDTO.class);
        dto.setHotel(convertToHotelResponseDTO(booking.getHotel()));
        
        // Map payment info (exclude sensitive information)
        if (booking.getPaymentInfo() != null) {
            dto.setPaymentMethod(booking.getPaymentInfo().getPaymentMethod());
            dto.setCardLastFour(booking.getPaymentInfo().getCardLastFour());
            dto.setCardholderName(booking.getPaymentInfo().getCardholderName());
            dto.setPaymentStatus(booking.getPaymentInfo().getPaymentStatus());
            dto.setPaymentTimestamp(booking.getPaymentInfo().getPaymentTimestamp());
            dto.setCurrencyCode(booking.getPaymentInfo().getCurrencyCode());
            dto.setTransactionId(booking.getPaymentInfo().getTransactionId());
        }
        
        return dto;
    }
    
    private HotelBooking.RoomType convertRoomType(String roomTypeString) {
        if (roomTypeString == null) {
            return HotelBooking.RoomType.DOUBLE; // Default
        }
        
        // Normalize the string and try to match
        String normalized = roomTypeString.toUpperCase().replace(" ", "_");
        
        // Map common room types
        switch (normalized) {
            case "DELUXE_SUITE":
            case "DELUXE":
                return HotelBooking.RoomType.DELUXE;
            case "PRESIDENTIAL_SUITE":
            case "PRESIDENTIAL":
                return HotelBooking.RoomType.PRESIDENTIAL_SUITE;
            case "EXECUTIVE_SUITE":
            case "JUNIOR_SUITE":
            case "SUITE":
                return HotelBooking.RoomType.SUITE;
            case "FAMILY_ROOM":
            case "FAMILY":
                return HotelBooking.RoomType.FAMILY_ROOM;
            case "SINGLE":
            case "SINGLE_ROOM":
                return HotelBooking.RoomType.SINGLE;
            case "TWIN":
            case "TWIN_ROOM":
                return HotelBooking.RoomType.TWIN;
            case "DOUBLE":
            case "DOUBLE_ROOM":
            case "STANDARD":
            case "STANDARD_ROOM":
            default:
                return HotelBooking.RoomType.DOUBLE;
        }
    }
}
