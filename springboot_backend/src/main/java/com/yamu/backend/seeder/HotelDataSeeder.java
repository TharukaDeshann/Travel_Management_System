package com.yamu.backend.seeder;


import com.yamu.backend.repository.HotelRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
public class HotelDataSeeder implements CommandLineRunner {
    
    private final HotelRepository hotelRepository;
   
    
    @Override
    public void run(String... args) throws Exception {
        if (hotelRepository.count() == 0) {
            log.info("Seeding initial hotel data...");
            
            
        } else {
            log.info("Hotel data already exists, skipping seeding.");
        }
    }
    

    
}
