package com.yamu.backend.seeder;

import com.yamu.backend.model.Hotel;
import com.yamu.backend.repository.HotelRepository;
import com.yamu.backend.service.HotelMockDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class HotelDataSeeder implements CommandLineRunner {
    
    private final HotelRepository hotelRepository;
    private final HotelMockDataService mockDataService;
    
    @Override
    public void run(String... args) throws Exception {
        if (hotelRepository.count() == 0) {
            log.info("Seeding initial hotel data...");
            seedHotels();
            log.info("Hotel data seeding completed.");
        } else {
            log.info("Hotel data already exists, skipping seeding.");
        }
    }
    
    private void seedHotels() {
        List<Hotel> hotels = Arrays.asList(
            createHotel(
                "Grand Colombo Hotel",
                "123 Galle Road, Colombo 03, Sri Lanka",
                6.9271, 79.8612,
                4.5, 1250,
                Hotel.MockDataTemplate.LUXURY_RESORT,
                "GOOGLE_PLACE_ID_001",
                "+94 11 234 5678",
                "https://grandcolombo.com",
                "photo_ref_001"
            ),
            createHotel(
                "Business Center Kandy",
                "45 Peradeniya Road, Kandy, Sri Lanka",
                7.2906, 80.6337,
                4.2, 890,
                Hotel.MockDataTemplate.BUSINESS_HOTEL,
                "GOOGLE_PLACE_ID_002",
                "+94 81 222 3333",
                "https://businesskandy.com",
                "photo_ref_002"
            ),
            createHotel(
                "Boutique Villa Galle",
                "67 Lighthouse Street, Galle Fort, Sri Lanka",
                6.0367, 80.2170,
                4.7, 567,
                Hotel.MockDataTemplate.BOUTIQUE_HOTEL,
                "GOOGLE_PLACE_ID_003",
                "+94 91 223 4567",
                "https://boutiquegalle.com",
                "photo_ref_003"
            ),
            createHotel(
                "Budget Inn Negombo",
                "89 Beach Road, Negombo, Sri Lanka",
                7.2084, 79.8380,
                3.8, 234,
                Hotel.MockDataTemplate.BUDGET_INN,
                "GOOGLE_PLACE_ID_004",
                "+94 31 227 8901",
                "https://budgetnegombo.com",
                "photo_ref_004"
            ),
            createHotel(
                "City Center Ratnapura",
                "12 Main Street, Ratnapura, Sri Lanka",
                6.6823, 80.4037,
                4.0, 445,
                Hotel.MockDataTemplate.CITY_CENTER_HOTEL,
                "GOOGLE_PLACE_ID_005",
                "+94 45 222 3456",
                "https://cityratnapura.com",
                "photo_ref_005"
            ),
            createHotel(
                "Luxury Resort Bentota",
                "Paradise Road, Bentota Beach, Sri Lanka",
                6.4262, 79.9951,
                4.8, 1890,
                Hotel.MockDataTemplate.LUXURY_RESORT,
                "GOOGLE_PLACE_ID_006",
                "+94 34 227 5678",
                "https://luxurybentota.com",
                "photo_ref_006"
            ),
            createHotel(
                "Mountain View Nuwara Eliya",
                "Hill Station Road, Nuwara Eliya, Sri Lanka",
                6.9497, 80.7891,
                4.3, 678,
                Hotel.MockDataTemplate.BOUTIQUE_HOTEL,
                "GOOGLE_PLACE_ID_007",
                "+94 52 222 1234",
                "https://mountainviewnuwaraeliya.com",
                "photo_ref_007"
            ),
            createHotel(
                "Comfort Lodge Anuradhapura",
                "Sacred City Road, Anuradhapura, Sri Lanka",
                8.3114, 80.4037,
                3.9, 334,
                Hotel.MockDataTemplate.BUDGET_INN,
                "GOOGLE_PLACE_ID_008",
                "+94 25 222 5678",
                "https://comfortanuradhapura.com",
                "photo_ref_008"
            ),
            createHotel(
                "Business Hub Jaffna",
                "45 Hospital Road, Jaffna, Sri Lanka",
                9.6615, 80.0255,
                4.1, 445,
                Hotel.MockDataTemplate.BUSINESS_HOTEL,
                "GOOGLE_PLACE_ID_009",
                "+94 21 222 3333",
                "https://businessjaffna.com",
                "photo_ref_009"
            ),
            createHotel(
                "Seaside Resort Trincomalee",
                "Uppuveli Beach, Trincomalee, Sri Lanka",
                8.5874, 81.2152,
                4.6, 890,
                Hotel.MockDataTemplate.LUXURY_RESORT,
                "GOOGLE_PLACE_ID_010",
                "+94 26 222 4567",
                "https://seasidetrincomalee.com",
                "photo_ref_010"
            )
        );
        
        hotelRepository.saveAll(hotels);
        log.info("Saved {} hotels to database", hotels.size());
    }
    
    private Hotel createHotel(String name, String address, Double latitude, Double longitude,
                             Double rating, Integer totalRatings, Hotel.MockDataTemplate template,
                             String googlePlaceId, String phoneNumber, String websiteUrl, 
                             String photoReference) {
        Hotel hotel = new Hotel();
        hotel.setName(name);
        hotel.setAddress(address);
        hotel.setLatitude(latitude);
        hotel.setLongitude(longitude);
        hotel.setRating(rating);
        hotel.setTotalRatings(totalRatings);
        hotel.setPriceLevel(template == Hotel.MockDataTemplate.LUXURY_RESORT ? 4 : 
                           template == Hotel.MockDataTemplate.BOUTIQUE_HOTEL ? 3 :
                           template == Hotel.MockDataTemplate.BUSINESS_HOTEL ? 3 :
                           template == Hotel.MockDataTemplate.CITY_CENTER_HOTEL ? 2 : 1);
        hotel.setMockDataTemplate(template);
        hotel.setGooglePlaceId(googlePlaceId);
        hotel.setPhoneNumber(phoneNumber);
        hotel.setWebsiteUrl(websiteUrl);
        hotel.setPhotoReference(photoReference);
        
        return hotel;
    }
}
