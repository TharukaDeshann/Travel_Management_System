package com.yamu.backend.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class HotelService {
    
    @Value("${amadeus.client.id}")
    private String clientId;
    
    @Value("${amadeus.client.secret}")
    private String clientSecret;
    
    @Value("${amadeus.api.base-url}")
    private String baseUrl;
    
    private String accessToken;
    
    private final RestTemplate restTemplate = new RestTemplate();

    public synchronized void authenticate() {
        String authUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        String requestBody = "grant_type=client_credentials" +
                   "&client_id=" + clientId +
                   "&client_secret=" + clientSecret +
                   "&scope=shopping";
        
        try {
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<AuthResponse> response = restTemplate.postForEntity(authUrl, request, AuthResponse.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                this.accessToken = response.getBody().getAccessToken();
            } else {
                throw new RuntimeException("Authentication failed: 1: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException(e.getLocalizedMessage());
        }
    }

    public ResponseEntity<String> searchHotels(String cityCode, String checkInDate, String checkOutDate) {
        if (accessToken == null) {
            authenticate();
        }
        
        String url = "https://test.api.amadeus.com/v4/shopping/hotel-offers";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url)
            .queryParam("cityCode", cityCode)
            .queryParam("checkInDate", checkInDate)
            .queryParam("checkOutDate", checkOutDate)
            .queryParam("adults", 1)
            .queryParam("bestRateOnly", true);
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try{
            return restTemplate.exchange(
            builder.toUriString(),
            HttpMethod.GET,
            entity,
            String.class
        );
        }catch(Exception e){
            authenticate();
            return restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                entity,
                String.class
            );
        }
    }

    private static class AuthResponse {
        private String accessToken;
        private String tokenType;
        private int expiresIn;
        
        // Getters and setters
        public String getAccessToken() {
            return accessToken;
        }
        
        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }
    }
    
}
