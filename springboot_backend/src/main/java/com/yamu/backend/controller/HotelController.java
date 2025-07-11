package com.yamu.backend.controller;

import com.yamu.backend.dto.*;
import com.yamu.backend.model.Hotel;
import com.yamu.backend.service.HotelService;
import com.yamu.backend.service.OpenStreetMapHotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HotelController {
    
    private final HotelService hotelService;
    private final OpenStreetMapHotelService openStreetMapHotelService;
    
    @PostMapping("/search")
    public ResponseEntity<List<HotelResponseDTO>> searchHotels(
            @Valid @RequestBody HotelSearchRequestDTO searchRequest) {
        try {
            log.info("Received hotel search request: {}", searchRequest);
            List<HotelResponseDTO> hotels = hotelService.searchHotelsAlongRoute(searchRequest);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            log.error("Error searching hotels: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{hotelId}")
    public ResponseEntity<HotelResponseDTO> getHotelDetails(@PathVariable Long hotelId) {
        try {
            return hotelService.getHotelDetails(hotelId)
                    .map(hotel -> ResponseEntity.ok(hotel))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting hotel details for ID {}: ", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{hotelId}/availability")
    public ResponseEntity<RoomAvailabilityDTO> getHotelAvailability(
            @PathVariable Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        try {
            RoomAvailabilityDTO availability = hotelService.getHotelRoomAvailability(hotelId, checkIn, checkOut);
            return ResponseEntity.ok(availability);
        } catch (RuntimeException e) {
            log.error("Error getting hotel availability: ", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting hotel availability for ID {}: ", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            @Valid @RequestBody HotelBookingRequestDTO bookingRequest,
            @RequestParam Long travelerId) {
        try {
            log.info("Creating booking for traveler {} at hotel {}", travelerId, bookingRequest.getHotelId());
            HotelBookingResponseDTO booking = hotelService.createBooking(bookingRequest, travelerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            log.error("Booking validation error: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating booking: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    @GetMapping("/bookings/traveler/{travelerId}")
    public ResponseEntity<List<HotelBookingResponseDTO>> getTravelerBookings(
            @PathVariable Long travelerId) {
        try {
            List<HotelBookingResponseDTO> bookings = hotelService.getTravelerBookings(travelerId);
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            log.error("Error getting traveler bookings: ", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting bookings for traveler {}: ", travelerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/bookings/{bookingReference}")
    public ResponseEntity<HotelBookingResponseDTO> getBookingDetails(
            @PathVariable String bookingReference) {
        try {
            return hotelService.getBookingByReference(bookingReference)
                    .map(booking -> ResponseEntity.ok(booking))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting booking details for reference {}: ", bookingReference, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/bookings/{bookingReference}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable String bookingReference,
            @RequestParam Long travelerId) {
        try {
            HotelBookingResponseDTO booking = hotelService.cancelBooking(bookingReference, travelerId);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            log.error("Booking cancellation error: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error cancelling booking {}: ", bookingReference, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    // Endpoint for testing mock data
    @GetMapping("/mock-data-test/{hotelId}")
    public ResponseEntity<RoomAvailabilityDTO> testMockData(
            @PathVariable Long hotelId) {
        try {
            LocalDate checkIn = LocalDate.now().plusDays(7);
            LocalDate checkOut = LocalDate.now().plusDays(9);
            RoomAvailabilityDTO availability = hotelService.getHotelRoomAvailability(hotelId, checkIn, checkOut);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            log.error("Error testing mock data for hotel {}: ", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint for testing Google Places API integration
    @GetMapping("/test-google-places")
    public ResponseEntity<?> testGooglePlacesAPI(
            @RequestParam Double startLat,
            @RequestParam Double startLng,
            @RequestParam Double endLat,
            @RequestParam Double endLng) {
        try {
            HotelSearchRequestDTO testRequest = new HotelSearchRequestDTO();
            testRequest.setStartLatitude(startLat);
            testRequest.setStartLongitude(startLng);
            testRequest.setEndLatitude(endLat);
            testRequest.setEndLongitude(endLng);
            testRequest.setRadius(5000.0);
            testRequest.setMinRating(3.0);
            testRequest.setMaxResults(5);
            
            List<HotelResponseDTO> hotels = hotelService.searchHotelsAlongRoute(testRequest);
            
            return ResponseEntity.ok(Map.of(
                "message", "Google Places API test completed",
                "hotelsFound", hotels.size(),
                "hotels", hotels
            ));
        } catch (Exception e) {
            log.error("Error testing Google Places API: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Google Places API test failed: " + e.getMessage()));
        }
    }
    
    // Debug endpoint to check database hotels
    @GetMapping("/debug/database-hotels")
    public ResponseEntity<?> getDatabaseHotels() {
        try {
            List<HotelResponseDTO> allHotels = hotelService.getAllHotels();
            return ResponseEntity.ok(Map.of(
                "message", "Database hotels retrieved",
                "totalHotels", allHotels.size(),
                "hotels", allHotels
            ));
        } catch (Exception e) {
            log.error("Error getting database hotels: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get database hotels: " + e.getMessage()));
        }
    }
    
    // DEBUG ENDPOINTS - Remove in production
    @GetMapping("/debug/database-search")
    public ResponseEntity<Map<String, Object>> debugDatabaseSearch(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radiusKm,
            @RequestParam(defaultValue = "3.0") Double minRating) {
        try {
            log.info("🔍 DEBUG: Database search for ({}, {}) radius={}km, minRating={}", 
                    latitude, longitude, radiusKm, minRating);
            
            Map<String, Object> debugInfo = hotelService.debugDatabaseSearch(latitude, longitude, radiusKm, minRating);
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            log.error("Error in debug database search: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/debug/all-hotels")
    public ResponseEntity<Map<String, Object>> debugAllHotels() {
        try {
            Map<String, Object> debugInfo = hotelService.debugAllHotels();
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            log.error("Error getting all hotels debug info: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/debug/osm-hotels-test")
    public ResponseEntity<Map<String, Object>> testOpenStreetMapAPI(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "2000") Double radius) {
        try {
            log.info("🧪 TESTING: OpenStreetMap Overpass API directly");
            
            Map<String, Object> testResult = new HashMap<>();
            testResult.put("searchParameters", Map.of(
                "latitude", latitude,
                "longitude", longitude,
                "radius", radius
            ));
            
            // Create a simple search request to test OpenStreetMapHotelService
            HotelSearchRequestDTO searchRequest = new HotelSearchRequestDTO();
            searchRequest.setStartLatitude(latitude);
            searchRequest.setStartLongitude(longitude);
            searchRequest.setEndLatitude(latitude);
            searchRequest.setEndLongitude(longitude);
            searchRequest.setRadius(radius);
            searchRequest.setMinRating(1.0); // Very low threshold for testing
            searchRequest.setMaxResults(10);
            
            List<Hotel> hotels = openStreetMapHotelService.searchHotelsAlongRoute(searchRequest);
            
            testResult.put("hotelsFound", hotels.size());
            testResult.put("hotels", hotels.stream().map(hotel -> {
                Map<String, Object> hotelInfo = new HashMap<>();
                hotelInfo.put("name", hotel.getName());
                hotelInfo.put("rating", hotel.getRating());
                hotelInfo.put("address", hotel.getAddress());
                hotelInfo.put("googlePlaceId", hotel.getGooglePlaceId());
                return hotelInfo;
            }).collect(Collectors.toList()));
            
            return ResponseEntity.ok(testResult);
            
        } catch (Exception e) {
            log.error("Error testing Google Places API: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
