package com.yamu.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.yamu.backend.service.HotelService;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {
    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping("/search")
    public ResponseEntity<String> searchHotels(
            @RequestParam String cityCode,
            @RequestParam String checkIn,
            @RequestParam String checkOut) {
        return hotelService.searchHotels(cityCode, checkIn, checkOut);
    }
   

    @GetMapping("/test-auth")
    public ResponseEntity<String> testAuthentication() {
        try {
            hotelService.authenticate(); // Force new authentication
            return ResponseEntity.ok("Successfully authenticated with Amadeus API");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication failed: " + e.getMessage());
        }
    }
}
