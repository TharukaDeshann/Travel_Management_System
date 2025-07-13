package com.yamu.backend.controller;

import com.yamu.backend.dto.BookDriverRequest;
import com.yamu.backend.dto.CancelBookingRequest;
import com.yamu.backend.dto.DriverDetailsDTO;
import com.yamu.backend.dto.DriverSummaryDTO;
import com.yamu.backend.dto.DriverBookingResponseDTO;
import com.yamu.backend.model.Driver;
import com.yamu.backend.model.DriverBooking;
import com.yamu.backend.repository.DriverBookingRepository;
import com.yamu.backend.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DriverBookingRepository bookingRepository;

    // List available drivers for a day
    @GetMapping("/available")
    public List<DriverSummaryDTO> getAvailableDrivers(@RequestParam("date") String date) {
        LocalDate bookingDate = LocalDate.parse(date);
        List<DriverBooking> booked = bookingRepository.findByBookingDateAndStatus(bookingDate, "BOOKED");
        List<Long> bookedDriverIds = booked.stream().map(b -> b.getDriver().getId()).collect(Collectors.toList());
        List<Driver> allDrivers = driverRepository.findAll();
        return allDrivers.stream()
                .filter(driver -> !bookedDriverIds.contains(driver.getId()))
                .map(DriverSummaryDTO::fromDriver)
                .collect(Collectors.toList());
    }

    // Get details for a driver
    @GetMapping("/{id}")
    public DriverDetailsDTO getDriverDetails(@PathVariable Long id) {
        Driver driver = driverRepository.findById(id).orElseThrow();
        return DriverDetailsDTO.fromDriver(driver);
    }

    // Book a driver for a date
// Book a driver for a date
    @PostMapping("/book")
    public String bookDriver(@RequestBody BookDriverRequest req) {
        LocalDate bookingDate = LocalDate.parse(req.date());
        Driver driver = driverRepository.findById(req.driverId()).orElseThrow();
        List<DriverBooking> existing = bookingRepository.findByDriverAndBookingDateAndStatus(driver, bookingDate, "BOOKED");
        if (!existing.isEmpty()) return "ALREADY_BOOKED";
        DriverBooking booking = new DriverBooking();
        booking.setDriver(driver);
        booking.setBookingDate(bookingDate);
        booking.setTravelerId(req.travelerId());
        booking.setStatus("BOOKED");

        // Set start and end location details
        if (req.startLocation() != null) {
            booking.setStartLocationName(req.startLocation().name());
            booking.setStartLocationLat(req.startLocation().latitude());
            booking.setStartLocationLon(req.startLocation().longitude());
        }
        if (req.endLocation() != null) {
            booking.setEndLocationName(req.endLocation().name());
            booking.setEndLocationLat(req.endLocation().latitude());
            booking.setEndLocationLon(req.endLocation().longitude());
        }

        bookingRepository.save(booking);
        return "BOOKED";
    }

    // Cancel a booking
    @PostMapping("/cancel")
    public String cancelBooking(@RequestBody CancelBookingRequest req) {
        LocalDate bookingDate = LocalDate.parse(req.date());
        Driver driver = driverRepository.findById(req.driverId()).orElseThrow();
        List<DriverBooking> bookings = bookingRepository.findByDriverAndBookingDateAndStatus(driver, bookingDate, "BOOKED");
        bookings.forEach(b -> {
            b.setStatus("CANCELLED");
            bookingRepository.save(b);
        });
        return "CANCELLED";
    }

    // Get traveler's driver bookings
    @GetMapping("/bookings/traveler/{travelerId}")
    public List<DriverBookingResponseDTO> getTravelerBookings(@PathVariable Long travelerId) {
        List<DriverBooking> bookings = bookingRepository.findByTravelerIdOrderByBookingDateAsc(travelerId);
        return bookings.stream()
                .map(DriverBookingResponseDTO::fromDriverBooking)
                .collect(Collectors.toList());
    }
}