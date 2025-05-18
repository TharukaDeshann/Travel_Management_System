package com.yamu.backend.service;

import com.yamu.backend.dto.ItineraryRequest;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.ItineraryRepository;
import com.yamu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private UserRepository userRepository;

    public Itinerary saveItinerary(ItineraryRequest request) {
        // Extract the authenticated user's email
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();

        // Fetch the user from the database
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create a new itinerary
        Itinerary itinerary = new Itinerary();
        itinerary.setId(UUID.randomUUID().toString()); // Generate a unique ID
        itinerary.setTripTitle(request.getTripTitle());
        itinerary.setStartDate(request.getStartDate());
        itinerary.setEndDate(request.getEndDate());
        itinerary.setBudget(request.getBudget());
        itinerary.setCurrency(request.getCurrency());
        itinerary.setUser(user);

        // Save the itinerary to the database
        return itineraryRepository.save(itinerary);
    }
}