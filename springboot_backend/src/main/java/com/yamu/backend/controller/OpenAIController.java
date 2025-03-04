package com.yamu.backend.controller;


import com.yamu.backend.errorresponses.ErrorResponse;

import com.yamu.backend.service.OpenAIService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class OpenAIController {
    private final OpenAIService openAIService;
    
    @PostMapping("/generate")
    public ResponseEntity<?> generateResponse(@RequestBody String prompt) {
        try {
            log.info("Received generate request with prompt length: {}", prompt.length());
            System.out.println("Received generate request with prompt : " + prompt);
            String response = openAIService.generateResponse(prompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in generate endpoint: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to generate response", e.getMessage()));
        }
    }
    
}