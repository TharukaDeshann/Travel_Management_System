package com.yamu.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yamu.backend.dto.DayPlanRequest;
import com.yamu.backend.dto.DayPlanResponse;
import com.yamu.backend.service.DayPlanService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/dayplans")
public class DayPlanController {
    private final DayPlanService dpService;

    public DayPlanController(DayPlanService dpService) {
        this.dpService = dpService;
    }

    @PostMapping
    public ResponseEntity<DayPlanResponse> add(@Valid @RequestBody DayPlanRequest dto) {
        DayPlanResponse resp = dpService.addDayPlan(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }
}

