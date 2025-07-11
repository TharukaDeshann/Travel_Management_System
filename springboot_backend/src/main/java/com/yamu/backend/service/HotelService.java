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
import java.util.List;
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
    private final GooglePlacesService googlePlacesService;
    private final ModelMapper modelMapper;
    
    public List<HotelResponseDTO> searchHotelsAlongRoute(HotelSearchRequestDTO searchRequest) {
        log.info("Searching hotels along route from ({}, {}) to ({}, {})",
                searchRequest.getStartLatitude(), searchRequest.getStartLongitude(),
                searchRequest.getEndLatitude(), searchRequest.getEndLongitude());
        
        // Set default values
        Double radius = searchRequest.getRadius() != null ? searchRequest.getRadius() / 1000 : 5.0; // Convert to km
        Double minRating = searchRequest.getMinRating() != null ? searchRequest.getMinRating() : 3.0;
        Integer maxResults = searchRequest.getMaxResults() != null ? searchRequest.getMaxResults() : 10;
        
        // Calculate midpoint for search center
        Double centerLat = (searchRequest.getStartLatitude() + searchRequest.getEndLatitude()) / 2;
        Double centerLng = (searchRequest.getStartLongitude() + searchRequest.getEndLongitude()) / 2;
        
        // First try to get hotels from database
        List<Hotel> existingHotels = hotelRepository.findHotelsNearRouteWithFiltersJPQL(
                centerLat, centerLng, radius, minRating, PageRequest.of(0, maxResults));
        
        // If not enough hotels in database, fetch from Google Places API
        if (existingHotels.size() < maxResults) {
            List<Hotel> googleHotels = googlePlacesService.searchHotelsAlongRoute(searchRequest);
            
            // Save new hotels to database with random mock data templates
            for (Hotel hotel : googleHotels) {
                if (hotelRepository.findByGooglePlaceId(hotel.getGooglePlaceId()).isEmpty()) {
                    hotel.setMockDataTemplate(mockDataService.getRandomTemplate());
                    hotelRepository.save(hotel);
                    existingHotels.add(hotel);
                }
            }
        }
        
        // Convert to DTOs with mock data
        return existingHotels.stream()
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
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        return mockDataService.generateMockRoomData(hotel.getMockDataTemplate(), checkIn, checkOut);
    }
    
    @Transactional
    public HotelBookingResponseDTO createBooking(HotelBookingRequestDTO bookingRequest, Long travelerId) {
        log.info("Creating hotel booking for traveler: {}, hotel: {}", travelerId, bookingRequest.getHotelId());
        
        // Validate inputs
        validateBookingRequest(bookingRequest);
        
        // Get hotel and traveler
        Hotel hotel = hotelRepository.findById(bookingRequest.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
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
        booking.setRoomType(bookingRequest.getRoomType());
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
        
        // Find the requested room type in availability
        Optional<RoomAvailabilityDTO.RoomTypeInfo> requestedRoom = availability.getAvailableRooms()
                .stream()
                .filter(room -> room.getRoomType() == request.getRoomType())
                .findFirst();
        
        if (requestedRoom.isEmpty()) {
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
        
        // Generate photo URL if photo reference exists
        if (hotel.getPhotoReference() != null) {
            dto.setPhotoUrl(googlePlacesService.generatePhotoUrl(hotel.getPhotoReference()));
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
}
