package com.yamu.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.yamu.backend.dto.DayPlanRequest;
import com.yamu.backend.dto.DayPlanResponse;
import com.yamu.backend.dto.LocationResponse;
import com.yamu.backend.dto.RouteRequest;
import com.yamu.backend.dto.RouteResponse;
import com.yamu.backend.model.DayPlan;
import com.yamu.backend.model.Itinerary;
import com.yamu.backend.model.Location;
import com.yamu.backend.model.Route;
import com.yamu.backend.repository.DayPlanRepository;
import com.yamu.backend.repository.ItineraryRepository;
import com.yamu.backend.repository.LocationRepository;
import com.yamu.backend.repository.RouteRepository;

@Service
public class DayPlanService {
    private final DayPlanRepository dpRepo;
    private final ItineraryRepository itRepo;
    private final RouteRepository rtRepo;
    private final LocationRepository locRepo;

    public DayPlanService(DayPlanRepository dpRepo, ItineraryRepository itRepo,
                          RouteRepository rtRepo, LocationRepository locRepo) {
        this.dpRepo = dpRepo;
        this.itRepo = itRepo;
        this.rtRepo = rtRepo;
        this.locRepo = locRepo;
    }

    public DayPlanResponse addDayPlan(DayPlanRequest dto) {
        Itinerary it = itRepo.findById(dto.getItineraryId())
            .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        // Create DayPlan
        DayPlan dp = new DayPlan();
        dp.setItinerary(it);
        dp.setDate(dto.getDate());
        dp.setHotelDetails(dto.getHotelDetails());
        dp.setTransportDetails(dto.getTransportDetails());
        dp.setGuideDetails(dto.getGuideDetails());

        // Map Locations
        List<Location> locs = dto.getLocations().stream().map(lr -> {
            Location loc = new Location();
            BeanUtils.copyProperties(lr, loc);
            loc.setDayPlan(dp);
            return loc;
        }).collect(Collectors.toList());
        dp.setLocations(locs);

        // Map Route
        if (dto.getRoute() != null) {
            RouteRequest rr = dto.getRoute();
            Route rt = new Route();
            BeanUtils.copyProperties(rr, rt);
            rt.setDayPlan(dp);
            dp.setRoute(rt);
        }

        DayPlan saved = dpRepo.save(dp);

        // Build Response
        DayPlanResponse resp = new DayPlanResponse();
        BeanUtils.copyProperties(saved, resp, "locations", "route");
        resp.setLocations(saved.getLocations().stream().map(this::toLocResp).toList());
        if (saved.getRoute() != null)
            resp.setRoute(toRouteResp(saved.getRoute()));
        return resp;
    }

    private LocationResponse toLocResp(Location loc) {
        LocationResponse r = new LocationResponse();
        BeanUtils.copyProperties(loc, r);
        return r;
    }

    private RouteResponse toRouteResp(Route rt) {
        RouteResponse r = new RouteResponse();
        BeanUtils.copyProperties(rt, r, "id");
        r.setId(rt.getId());
        return r;
    }
}
