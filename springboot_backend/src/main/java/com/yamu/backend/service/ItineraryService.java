package com.yamu.backend.service;

import com.yamu.backend.dto.ItineraryRequest;
import com.yamu.backend.dto.ItineraryResponse;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.model.Traveler;
import com.yamu.backend.model.User;
import com.yamu.backend.repository.ItineraryRepository;
import com.yamu.backend.repository.TravelerRepository;
import com.yamu.backend.repository.UserRepository;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ItineraryService {
    private final ItineraryRepository itRepo;
    private final TravelerRepository trRepo;

    public ItineraryService(ItineraryRepository itRepo, TravelerRepository trRepo) {
        this.itRepo = itRepo;
        this.trRepo = trRepo;
    }

    public ItineraryResponse create(ItineraryRequest dto) {
        Traveler traveler = trRepo.findById(dto.getTravelerId())
            .orElseThrow(() -> new RuntimeException("Traveler not found"));

        Itinerary it = new Itinerary();
        it.setBudget(dto.getBudget());
        it.setCurrency(dto.getCurrency());
        it.setStartDate(dto.getStartDate());
        it.setEndDate(dto.getEndDate());
        it.setTripTitle(dto.getTripTitle());
        it.setTraveler(traveler);

        Itinerary saved = itRepo.save(it);
        ItineraryResponse r = new ItineraryResponse();
        BeanUtils.copyProperties(saved, r, "id");
        r.setId(saved.getId());
        return r;
    }
}
