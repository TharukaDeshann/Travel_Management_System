package com.yamu.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import java.util.logging.Logger;
import java.util.HashMap;
import java.util.Map;

import com.yamu.backend.model.WeatherResponse;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*") // Allow from all origins for testing
public class WeatherController {
    
    private static final Logger logger = Logger.getLogger(WeatherController.class.getName());

    @Value("${weather.api.key}")
    private String apiKey;

    @GetMapping("/test")
    public ResponseEntity<?> testApi() {
        try {
            logger.info("Testing weather API with key: " + apiKey);
            
            // Test with a known city like London
            String url = "https://api.openweathermap.org/data/2.5/weather?q=London&appid=" + apiKey + "&units=metric";
            logger.info("Test URL: " + url);
            
            RestTemplate restTemplate = new RestTemplate();
            Object response = restTemplate.getForObject(url, Object.class);
            
            Map<String, Object> result = new HashMap<>();
            result.put("status", "API key is working");
            result.put("sample_response", response);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("API test failed: " + e.getMessage());
            
            Map<String, Object> result = new HashMap<>();
            result.put("status", "API key is NOT working");
            result.put("error", e.getMessage());
            
            return ResponseEntity.ok(result);
        }
    }

    @GetMapping("/{city}")
    public ResponseEntity<?> getWeather(@PathVariable String city) {
        try {
            if (city == null || city.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("City name cannot be empty");
            }
            
            logger.info("Fetching weather for city: " + city);
            logger.info("Using API key from application.properties: " + apiKey);
            
            // Make sure to use the correct free tier endpoint
            String url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=metric";
            logger.info("Request URL: " + url);
            
            RestTemplate restTemplate = new RestTemplate();
            WeatherResponse response = restTemplate.getForObject(url, WeatherResponse.class);
            
            if (response == null) {
                return ResponseEntity.notFound().build();
            }
            
            logger.info("Weather data successfully retrieved for " + city);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException e) {
            logger.severe("Error fetching weather data: " + e.getMessage());
            logger.severe("Response body: " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                .body("Error fetching weather: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            logger.severe("Unexpected error: " + e.getMessage());
            e.printStackTrace(); // This will print the full stack trace
            return ResponseEntity.internalServerError()
                .body("An unexpected error occurred: " + e.getMessage());
        }
    }
}
