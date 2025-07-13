package com.yamu.backend.repository;

import com.yamu.backend.model.Hotel;
import com.yamu.backend.model.HotelBooking;
import com.yamu.backend.model.Traveler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HotelBookingRepository extends JpaRepository<HotelBooking, Long> {
    
    Optional<HotelBooking> findByBookingReference(String bookingReference);
    
    List<HotelBooking> findByTraveler(Traveler traveler);
    
    List<HotelBooking> findByHotel(Hotel hotel);
    
    List<HotelBooking> findByTravelerOrderByCreatedAtDesc(Traveler traveler);
    
    @Query("SELECT hb FROM HotelBooking hb WHERE hb.traveler.id = :travelerId AND " +
           "hb.bookingStatus IN ('CONFIRMED', 'CHECKED_IN') ORDER BY hb.checkInDate ASC")
    List<HotelBooking> findActiveBookingsByTraveler(@Param("travelerId") Long travelerId);
    
    @Query("SELECT hb FROM HotelBooking hb WHERE hb.hotel.id = :hotelId AND " +
           "hb.checkInDate <= :checkOutDate AND hb.checkOutDate >= :checkInDate AND " +
           "hb.bookingStatus NOT IN ('CANCELLED', 'NO_SHOW')")
    List<HotelBooking> findOverlappingBookings(@Param("hotelId") Long hotelId,
                                             @Param("checkInDate") LocalDate checkInDate,
                                             @Param("checkOutDate") LocalDate checkOutDate);
    
    @Query("SELECT COUNT(hb) FROM HotelBooking hb WHERE hb.hotel.id = :hotelId AND " +
           "hb.checkInDate <= :checkOutDate AND hb.checkOutDate >= :checkInDate AND " +
           "hb.roomType = :roomType AND hb.bookingStatus NOT IN ('CANCELLED', 'NO_SHOW')")
    Long countRoomBookings(@Param("hotelId") Long hotelId,
                          @Param("checkInDate") LocalDate checkInDate,
                          @Param("checkOutDate") LocalDate checkOutDate,
                          @Param("roomType") HotelBooking.RoomType roomType);
    
    List<HotelBooking> findByBookingStatus(HotelBooking.BookingStatus status);
    
    @Query("SELECT hb FROM HotelBooking hb WHERE hb.checkInDate = :date AND " +
           "hb.bookingStatus = 'CONFIRMED'")
    List<HotelBooking> findBookingsForCheckInDate(@Param("date") LocalDate date);
    
    @Query("SELECT hb FROM HotelBooking hb WHERE hb.checkOutDate = :date AND " +
           "hb.bookingStatus = 'CHECKED_IN'")
    List<HotelBooking> findBookingsForCheckOutDate(@Param("date") LocalDate date);
}
