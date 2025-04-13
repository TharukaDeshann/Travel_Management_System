package com.yamu.backend.controller;

import com.yamu.backend.dto.RouteCreateRequest;
import com.yamu.backend.dto.RouteResponse;
import com.yamu.backend.service.RouteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/routes")
@Validated
public class RouteController {

    private final RouteService routeService;

    @Autowired
    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public List<RouteResponse> getAllRoutes() {
        return routeService.getAllRoutes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponse> getRouteById(@PathVariable long id) {
        return routeService.getRouteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RouteResponse> createRoute(@Valid @RequestBody RouteCreateRequest createRequest) {
        RouteResponse savedRoute = routeService.createRoute(createRequest);
        return ResponseEntity.ok(savedRoute);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RouteResponse> updateRoute(@PathVariable long id, @Valid @RequestBody RouteCreateRequest updateRequest) {
        RouteResponse updatedRoute = routeService.updateRoute(id, updateRequest);
        return ResponseEntity.ok(updatedRoute);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable long id) {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }
}