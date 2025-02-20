package com.yamu.backend.controller;


import com.azure.core.annotation.Post;
import com.yamu.backend.model.TravelQuery;
import com.yamu.backend.model.TravelResponse;
import com.yamu.backend.service.OpenAIService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/travel")
public class OpenAIController {

    @Autowired
    private OpenAIService openAIService;

    @PostMapping("/query")
    public ResponseEntity<TravelResponse> getTravelInfo(@RequestBody TravelQuery query) {
        String response = openAIService.getTravelResponse(query.getQuery());
        return ResponseEntity.ok(new TravelResponse(response));
    }
    @RequestMapping("/welcome")
    public String welcomeTo() {
        return "This is welcome page !";
    }
}
