package com.yamu.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.yamu.backend.dto.DriverBookingResponseDTO;
import com.yamu.backend.dto.GuideReservationResponse;
import com.yamu.backend.dto.HotelBookingResponseDTO;
import com.yamu.backend.dto.UserDto;
import com.yamu.backend.model.DriverBooking;
import com.yamu.backend.model.GuideReservationByTraveler;
import com.yamu.backend.model.GuideReservationDayDetail;
import com.yamu.backend.repository.DriverBookingRepository;
import com.yamu.backend.service.GuideReservationByTravelerService;
import com.yamu.backend.service.HotelService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/search/travelers")
public class TravelerSearchController {
    private static final Logger log = LoggerFactory.getLogger(TravelerSearchController.class);



    private final GuideReservationByTravelerService reservationService;
    private final HotelService hotelService;
    private final DriverBookingRepository bookingRepository;

    public TravelerSearchController(GuideReservationByTravelerService reservationService, HotelService hotelService, DriverBookingRepository bookingRepository) {
        this.reservationService = reservationService;
        this.hotelService = hotelService;
        this.bookingRepository = bookingRepository;
    }

    private GuideReservationResponse convertToDto(GuideReservationByTraveler reservation) {
        GuideReservationResponse dto = new GuideReservationResponse();
        dto.setId(reservation.getId());
        
        if (reservation.getTraveler() != null) {
            dto.setTravelerId(reservation.getTraveler().getId());
            dto.setTraveler(UserDto.fromEntity(reservation.getTraveler()));
        }
        
        if (reservation.getGuide() != null) {
            dto.setGuideId(reservation.getGuide().getId());
            // Add guide name and contact
            dto.setGuideName(reservation.getGuide().getFirstName() + " " + reservation.getGuide().getLastName());
            dto.setGuideContact(reservation.getGuide().getContactNumber());
        }
        
        dto.setNumberOfDays(reservation.getNumberOfDays());
        
        if (reservation.getStatus() != null) {
            dto.setStatus(reservation.getStatus().name());
        }
        
        if (reservation.getCreatedAt() != null) {
            dto.setCreatedAt(reservation.getCreatedAt().toString());
        }
        
        if (reservation.getUpdatedAt() != null) {
            dto.setUpdatedAt(reservation.getUpdatedAt().toString());
        }
        
        if (reservation.getDayDetails() != null) {
            dto.setDayDetails(reservation.getDayDetails().stream()
                .map(this::convertDayDetailToDto)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }

     private GuideReservationResponse.DayDetailDto convertDayDetailToDto(GuideReservationDayDetail dayDetail) {
        GuideReservationResponse.DayDetailDto dayDetailDto = new GuideReservationResponse.DayDetailDto();
        dayDetailDto.setDayNumber(dayDetail.getDayNumber());
        dayDetailDto.setPlaces(dayDetail.getPlaces());
        dayDetailDto.setDate(dayDetail.getDate().toString());
        dayDetailDto.setNumberOfTravelers(dayDetail.getNumberOfTravelers());
        dayDetailDto.setVehicleRequested(dayDetail.getVehicleRequested());
        dayDetailDto.setVehicleDetails(dayDetail.getVehicleDetails());
        return dayDetailDto;
    }


      @GetMapping("/traveler/{travelerId}")
    public ResponseEntity<List<GuideReservationResponse>> getTravelerReservations(
            @PathVariable Long travelerId) {
        List<GuideReservationByTraveler> reservations = reservationService.getReservationsForTraveler(travelerId);
        List<GuideReservationResponse> response = reservations.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    

    

     @GetMapping("/bookings/traveler/{travelerId}")
    public ResponseEntity<List<HotelBookingResponseDTO>> getTravelerHotelBookings(
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

    // Get traveler's driver bookings
    @GetMapping("/bookings/traveler/{travelerId}")
    public List<DriverBookingResponseDTO> getTravelerDriverBookings(@PathVariable Long travelerId) {
        List<DriverBooking> bookings = bookingRepository.findByTravelerIdOrderByBookingDateAsc(travelerId);
        return bookings.stream()
                .map(DriverBookingResponseDTO::fromDriverBooking)
                .collect(Collectors.toList());
    }




}
