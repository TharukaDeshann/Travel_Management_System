package com.yamu.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "http://localhost:5173")
public class WeatherController {
    // Cache to store weather data for location+date combinations
    private final Map<String, Map<String, Object>> weatherCache = new HashMap<>();

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWeatherForecast(
            @RequestParam String location,
            @RequestParam String date
    ) {
        // Create a unique key for this location and date
        String cacheKey = location + "_" + date;
        
        // Check if we already have weather data for this combination
        if (weatherCache.containsKey(cacheKey)) {
            return ResponseEntity.ok(weatherCache.get(cacheKey));
        }

        Map<String, Object> weatherData = new HashMap<>();
        LocalDate forecastDate = LocalDate.parse(date);
        LocalDate today = LocalDate.now();
        
        // Use deterministic values based on the hash of location and date
        int hash = (location + date).hashCode();
        // Make sure hash is positive
        hash = Math.abs(hash);
        
        if (forecastDate.isBefore(today.plusDays(6)) && !forecastDate.isBefore(today)) {
            // More moderate range for near dates
            weatherData.put("temperature", 25 + (hash % 10)); // Temperature between 25-35°C
            weatherData.put("humidity", 50 + (hash % 30)); // Humidity between 50-80%
            
            String[] conditions = {"Sunny", "Partly Cloudy", "Cloudy", "Light Rain"};
            weatherData.put("condition", conditions[hash % conditions.length]);
        } else {
            // More variable range for far dates
            weatherData.put("temperature", 20 + (hash % 15)); // Temperature between 20-35°C
            weatherData.put("humidity", 40 + (hash % 40)); // Humidity between 40-80%
            
            String[] conditions = {"Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Thunderstorm"};
            weatherData.put("condition", conditions[hash % conditions.length]);
        }
        
        weatherData.put("date", date);
        weatherData.put("location", location);
        
        // Cache the generated weather data
        weatherCache.put(cacheKey, weatherData);
        
        return ResponseEntity.ok(weatherData);
    }
}