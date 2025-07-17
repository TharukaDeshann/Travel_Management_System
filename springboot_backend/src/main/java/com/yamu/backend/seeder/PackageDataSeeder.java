package com.yamu.backend.seeder;

import com.yamu.backend.model.*;
import com.yamu.backend.repository.*;
import com.yamu.backend.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class PackageDataSeeder {
    
    @Autowired
    private PackageRepository packageRepository;
    
    @Autowired
    private PackageAttractionRepository packageAttractionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GuideRepository guideRepository;
    
    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @PostConstruct
    public void seedTravelPackages() {
        // Check if packages already exist
        if (packageRepository.count() > 0) {
            System.out.println("✅ Travel packages already exist, skipping seeding");
            return;
        }
        
        // Get an admin user for creating packages
        Optional<User> adminUser = userRepository.findByRole(UserRole.ADMIN).stream().findFirst();
        if (adminUser.isEmpty()) {
            System.out.println("❌ No admin user found, cannot create packages");
            return;
        }
        
        Admin admin = (Admin) adminUser.get();
        
        // Create 3 predefined travel packages
        createSigiriyaCulturalPackage(admin);
        createKandyReligiousPackage(admin);
        createGalleBeachPackage(admin);
        
        System.out.println("✅ Successfully seeded 3 travel packages with attractions");
    }
    
    private void createSigiriyaCulturalPackage(Admin admin) {
        // Create the main package
        TravelPackage sigiriyaPackage = new TravelPackage();
        sigiriyaPackage.setName("Sigiriya Cultural Heritage Tour");
        sigiriyaPackage.setDescription("Experience the ancient wonder of Sigiriya, the 8th wonder of the world. This 3-day cultural tour takes you through the magnificent rock fortress, ancient frescoes, and the beautiful gardens that surround this UNESCO World Heritage site.");
        sigiriyaPackage.setMainAttraction("Sigiriya Rock Fortress");
        sigiriyaPackage.setDurationDays(3);
        sigiriyaPackage.setStartDate(LocalDate.now().plusDays(30));
        sigiriyaPackage.setEndDate(LocalDate.now().plusDays(32));
        sigiriyaPackage.setHotelCost(new BigDecimal("150.00"));
        sigiriyaPackage.setGuideCost(new BigDecimal("75.00"));
        sigiriyaPackage.setTransportCost(new BigDecimal("60.00"));
        sigiriyaPackage.setAttractionCost(new BigDecimal("45.00"));
        sigiriyaPackage.setTotalBudget(new BigDecimal("330.00"));
        sigiriyaPackage.setCreatedBy(admin);
        sigiriyaPackage.setIsActive(true);
        sigiriyaPackage.setMaxTravelers(8);
        sigiriyaPackage.setImageUrl("/images/sigiriya.jpg");
        sigiriyaPackage.setCategory(TravelPackage.PackageCategory.CULTURAL);
        
        // Assign resources if available
        assignResources(sigiriyaPackage);
        
        TravelPackage savedPackage = packageRepository.save(sigiriyaPackage);
        
        // Create attractions for Sigiriya package
        List<PackageAttraction> sigiriyaAttractions = Arrays.asList(
            createAttraction(savedPackage, "Sigiriya Rock Fortress", 
                "Ancient palace and fortress complex built on a massive rock column", 
                7.9569, 80.7597, "Sigiriya, Central Province, Sri Lanka", 1, 
                new BigDecimal("30.00"), "/images/sigiriya.jpg", 
                "Best to visit early morning to avoid crowds and heat. Bring water and comfortable shoes.", true),
            
            createAttraction(savedPackage, "Sigiriya Museum", 
                "Museum showcasing artifacts and history of the Sigiriya complex", 
                7.9565, 80.7590, "Sigiriya Museum, Sigiriya, Sri Lanka", 2, 
                new BigDecimal("5.00"), "/images/sigiriya-museum.jpg", 
                "Visit before climbing the rock to understand the history better.", false),
            
            createAttraction(savedPackage, "Pidurangala Rock", 
                "Alternative viewpoint offering spectacular views of Sigiriya", 
                7.9667, 80.7500, "Pidurangala, Central Province, Sri Lanka", 3, 
                new BigDecimal("15.00"), "/images/pidurangala.jpg", 
                "Perfect for sunset views of Sigiriya. Less crowded than the main site.", false),
            
            createAttraction(savedPackage, "Dambulla Cave Temple", 
                "Ancient Buddhist temple complex with cave paintings", 
                7.8567, 80.6491, "Dambulla, Central Province, Sri Lanka", 4, 
                new BigDecimal("25.00"), "/images/dambulla.jpg", 
                "Dress modestly as this is a religious site. Remove shoes before entering.", false)
        );
        
        packageAttractionRepository.saveAll(sigiriyaAttractions);
        System.out.println("✅ Created Sigiriya Cultural Package with 4 attractions");
    }
    
    private void createKandyReligiousPackage(Admin admin) {
        // Create the main package
        TravelPackage kandyPackage = new TravelPackage();
        kandyPackage.setName("Kandy Sacred City & Temple Tour");
        kandyPackage.setDescription("Discover the spiritual heart of Sri Lanka in Kandy, home to the Temple of the Sacred Tooth Relic. This 2-day religious tour combines ancient temples, cultural performances, and the serene beauty of the hill country.");
        kandyPackage.setMainAttraction("Temple of the Sacred Tooth Relic");
        kandyPackage.setDurationDays(2);
        kandyPackage.setStartDate(LocalDate.now().plusDays(45));
        kandyPackage.setEndDate(LocalDate.now().plusDays(46));
        kandyPackage.setHotelCost(new BigDecimal("120.00"));
        kandyPackage.setGuideCost(new BigDecimal("50.00"));
        kandyPackage.setTransportCost(new BigDecimal("40.00"));
        kandyPackage.setAttractionCost(new BigDecimal("35.00"));
        kandyPackage.setTotalBudget(new BigDecimal("245.00"));
        kandyPackage.setCreatedBy(admin);
        kandyPackage.setIsActive(true);
        kandyPackage.setMaxTravelers(6);
        kandyPackage.setImageUrl("/images/kandy-temple.jpg");
        kandyPackage.setCategory(TravelPackage.PackageCategory.RELIGIOUS);
        
        // Assign resources if available
        assignResources(kandyPackage);
        
        TravelPackage savedPackage = packageRepository.save(kandyPackage);
        
        // Create attractions for Kandy package
        List<PackageAttraction> kandyAttractions = Arrays.asList(
            createAttraction(savedPackage, "Temple of the Sacred Tooth Relic", 
                "Most sacred Buddhist temple in Sri Lanka, housing the tooth relic of Buddha", 
                7.2934, 80.6414, "Sri Dalada Veediya, Kandy, Sri Lanka", 1, 
                new BigDecimal("25.00"), "/images/kandy-temple.jpg", 
                "Dress modestly and remove shoes. Best visited during evening puja ceremonies.", true),
            
            createAttraction(savedPackage, "Kandy Lake", 
                "Artificial lake built in 1807, perfect for peaceful walks and photography", 
                7.2956, 80.6389, "Kandy Lake, Kandy, Sri Lanka", 2, 
                new BigDecimal("0.00"), "/images/kandy-lake.jpg", 
                "Beautiful for sunset walks. Watch out for monkeys around the lake.", false),
            
            createAttraction(savedPackage, "Royal Botanical Gardens", 
                "Spectacular gardens with over 4000 species of plants and trees", 
                7.2733, 80.5956, "Peradeniya, Kandy, Sri Lanka", 3, 
                new BigDecimal("20.00"), "/images/peradeniya-gardens.jpg", 
                "Visit early morning for best lighting. Don't miss the orchid house.", false),
            
            createAttraction(savedPackage, "Cultural Dance Performance", 
                "Traditional Kandyan dance and drum performances", 
                7.2934, 80.6414, "Kandy Cultural Centre, Kandy, Sri Lanka", 4, 
                new BigDecimal("15.00"), "/images/kandy-dance.jpg", 
                "Evening performances available. Book in advance during peak season.", false)
        );
        
        packageAttractionRepository.saveAll(kandyAttractions);
        System.out.println("✅ Created Kandy Religious Package with 4 attractions");
    }
    
    private void createGalleBeachPackage(Admin admin) {
        // Create the main package
        TravelPackage gallePackage = new TravelPackage();
        gallePackage.setName("Galle Fort & Southern Beaches");
        gallePackage.setDescription("Explore the historic Galle Fort, a UNESCO World Heritage site, and relax on the pristine southern beaches. This 4-day beach and cultural tour combines history, relaxation, and adventure.");
        gallePackage.setMainAttraction("Galle Fort");
        gallePackage.setDurationDays(4);
        gallePackage.setStartDate(LocalDate.now().plusDays(60));
        gallePackage.setEndDate(LocalDate.now().plusDays(63));
        gallePackage.setHotelCost(new BigDecimal("200.00"));
        gallePackage.setGuideCost(new BigDecimal("80.00"));
        gallePackage.setTransportCost(new BigDecimal("70.00"));
        gallePackage.setAttractionCost(new BigDecimal("50.00"));
        gallePackage.setTotalBudget(new BigDecimal("400.00"));
        gallePackage.setCreatedBy(admin);
        gallePackage.setIsActive(true);
        gallePackage.setMaxTravelers(10);
        gallePackage.setImageUrl("/images/galle-fort.jpg");
        gallePackage.setCategory(TravelPackage.PackageCategory.BEACH);
        
        // Assign resources if available
        assignResources(gallePackage);
        
        TravelPackage savedPackage = packageRepository.save(gallePackage);
        
        // Create attractions for Galle package
        List<PackageAttraction> galleAttractions = Arrays.asList(
            createAttraction(savedPackage, "Galle Fort", 
                "17th-century Dutch fort with colonial architecture and stunning ocean views", 
                6.0535, 80.2210, "Galle Fort, Galle, Sri Lanka", 1, 
                new BigDecimal("20.00"), "/images/galle-fort.jpg", 
                "Best explored on foot. Visit the lighthouse and ramparts for amazing views.", true),
            
            createAttraction(savedPackage, "Unawatuna Beach", 
                "Crescent-shaped beach with golden sand and crystal clear waters", 
                6.0167, 80.2500, "Unawatuna, Galle, Sri Lanka", 2, 
                new BigDecimal("0.00"), "/images/unawatuna-beach.jpg", 
                "Perfect for swimming and snorkeling. Best visited early morning or late afternoon.", false),
            
            createAttraction(savedPackage, "Mirissa Beach", 
                "Famous for whale watching and pristine beaches", 
                5.9500, 80.4667, "Mirissa, Matara, Sri Lanka", 3, 
                new BigDecimal("0.00"), "/images/mirissa-beach.jpg", 
                "Whale watching season is December to April. Book tours in advance.", false),
            
            createAttraction(savedPackage, "Hikkaduwa Beach", 
                "Popular beach destination known for surfing and coral reefs", 
                6.1333, 80.1000, "Hikkaduwa, Galle, Sri Lanka", 4, 
                new BigDecimal("0.00"), "/images/hikkaduwa-beach.jpg", 
                "Great for surfing beginners. Coral reef is perfect for snorkeling.", false),
            
            createAttraction(savedPackage, "Galle Lighthouse", 
                "Iconic lighthouse within the fort, offering panoramic views", 
                6.0535, 80.2210, "Galle Fort, Galle, Sri Lanka", 5, 
                new BigDecimal("5.00"), "/images/galle-lighthouse.jpg", 
                "Visit during sunset for spectacular photo opportunities.", false)
        );
        
        packageAttractionRepository.saveAll(galleAttractions);
        System.out.println("✅ Created Galle Beach Package with 5 attractions");
    }
    
    private PackageAttraction createAttraction(TravelPackage travelPackage, String name, String description, 
                                             Double latitude, Double longitude, String address, Integer visitOrder,
                                             BigDecimal entranceFee, String imageUrl, String visitingTips, Boolean isMainAttraction) {
        PackageAttraction attraction = new PackageAttraction();
        attraction.setTravelPackage(travelPackage);
        attraction.setAttractionName(name);
        attraction.setDescription(description);
        attraction.setLatitude(latitude);
        attraction.setLongitude(longitude);
        attraction.setAddress(address);
        attraction.setVisitOrder(visitOrder);
        attraction.setEntranceFee(entranceFee);
        attraction.setImageUrl(imageUrl);
        attraction.setVisitingTips(visitingTips);
        attraction.setIsMainAttraction(isMainAttraction);
        return attraction;
    }
    
    private void assignResources(TravelPackage travelPackage) {
        // Try to assign a guide if available
        List<Guide> guides = guideRepository.findAll();
        if (!guides.isEmpty()) {
            travelPackage.setAssignedGuide(guides.get(0));
        }
        
        // Try to assign a driver if available
        List<Driver> drivers = driverRepository.findAll();
        if (!drivers.isEmpty()) {
            travelPackage.setAssignedDriver(drivers.get(0));
        }
        
        // Try to assign a hotel if available
        List<Hotel> hotels = hotelRepository.findAll();
        if (!hotels.isEmpty()) {
            travelPackage.setAssignedHotel(hotels.get(0));
        }
    }
} 