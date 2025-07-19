package com.yamu.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import com.yamu.backend.service.FacebookTokenService;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/facebook-events")
@CrossOrigin(origins = "*")
public class FacebookEventsController {
    private static final Logger logger = Logger.getLogger(FacebookEventsController.class.getName());

    // Main page ID as specified by the user
    private final String pageId = "708620612326863"; // EVENT SRI LANKA page ID
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private FacebookTokenService facebookTokenService;

    @PostConstruct
    public void init() {
        try {
            // Set the initial access token
            facebookTokenService.setInitialAccessToken("EAATqJ86HavgBPITthSGX43aeSj2THy2U4rnGIRlkqzCZAImA176ZBv33tEicq10MILJBJwIScyDor4qTceQEb5xRVEiSC0fz5Qy9RZC9nDK9PZBZAH64WBopvP9ofZCAYewsWxRZBOmcHMkQwNPqz6o3zQF9HQv8FKyKqywrWi5eFyM4MjAXqlsUiyR8li8n5vsESpZBaFWXdqodrxNeCFiSWsAyyGRbefTlyVZAvjCUZD");
        } catch (Exception e) {
            logger.log(Level.WARNING, "Failed to set initial Facebook access token", e);
        }
    }

    @GetMapping
    public ResponseEntity<?> getEvents() {
        logger.info("Fetching Facebook events for page ID: " + pageId);
        
        String accessToken = facebookTokenService.getCurrentAccessToken();
        if (accessToken == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Facebook is not configured properly. Please check your configuration.");
            return ResponseEntity.status(503).body(errorResponse);
        }
        
        try {
            Map<String, Object> response = fetchEventsFromPage(pageId);
            
            if (response.containsKey("error")) {
                logger.severe("Facebook API returned an error: " + response.get("error"));
                return ResponseEntity.status(500).body(response);
            }
            
            if (!response.containsKey("data")) {
                logger.warning("Response does not contain 'data' field: " + response);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Facebook API response missing 'data' field");
                return ResponseEntity.status(500).body(errorResponse);
            }
            
            List<Map<String, Object>> eventsData = (List<Map<String, Object>>) response.get("data");
            
            if (eventsData.isEmpty()) {
                logger.info("No events found for page");
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            List<Map<String, Object>> processedEvents = processEvents(eventsData);
            logger.info("Processed " + processedEvents.size() + " events");
            
            return ResponseEntity.ok(processedEvents);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error processing Facebook events", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error fetching Facebook events: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    private Map<String, Object> fetchEventsFromPage(String pageId) {
        try {
            String accessToken = facebookTokenService.getCurrentAccessToken();
            if (accessToken == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Facebook access token not available");
                return errorResponse;
            }

            String url = String.format(
                "https://graph.facebook.com/v18.0/%s/events?access_token=%s&fields=id,name,description,start_time,end_time,cover",
                pageId, accessToken);
            
            logger.info("Making request to Facebook Graph API");
            
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                logger.warning("Received null response from Facebook API");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Received null response from Facebook API");
                return errorResponse;
            }
            
            logger.info("Received response from Facebook API");
            return response;
        } catch (RestClientException e) {
            logger.log(Level.SEVERE, "Error calling Facebook API", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to connect to Facebook API: " + e.getMessage());
            return errorResponse;
        }
    }
    
    @GetMapping("/debug")
    public ResponseEntity<?> getDebugInfo() {
        logger.info("Fetching debug info for Facebook API");
        Map<String, Object> debugInfo = new HashMap<>();
        
        String accessToken = facebookTokenService.getCurrentAccessToken();
        if (accessToken == null) {
            debugInfo.put("error", "Facebook is not configured properly");
            return ResponseEntity.status(503).body(debugInfo);
        }

        try {
            // 1: Page Information
            String pageUrl = String.format(
                "https://graph.facebook.com/v18.0/%s?access_token=%s",
                pageId, accessToken);
            
            logger.info("Making request to get page info");
            Map<String, Object> pageResponse = restTemplate.getForObject(pageUrl, Map.class);
            debugInfo.put("page_info", pageResponse);
            
            // 2: Access Token Debug
            String tokenDebugUrl = String.format(
                "https://graph.facebook.com/debug_token?input_token=%s&access_token=%s",
                accessToken, accessToken);
            
            logger.info("Making request to debug token");
            Map<String, Object> tokenResponse = restTemplate.getForObject(tokenDebugUrl, Map.class);
            debugInfo.put("token_info", tokenResponse);
            
            // 3: Raw Events Call
            String eventsUrl = String.format(
                "https://graph.facebook.com/v18.0/%s/events?access_token=%s",
                pageId, accessToken);
            
            logger.info("Making basic events request");
            Map<String, Object> eventsResponse = restTemplate.getForObject(eventsUrl, Map.class);
            debugInfo.put("events_basic", eventsResponse);
            
            // 4: Detailed Events Call
            String detailedEventsUrl = String.format(
                "https://graph.facebook.com/v18.0/%s/events?access_token=%s&fields=id,name,description,start_time,end_time,cover",
                pageId, accessToken);
            
            logger.info("Making detailed events request");
            Map<String, Object> detailedEventsResponse = restTemplate.getForObject(detailedEventsUrl, Map.class);
            debugInfo.put("events_detailed", detailedEventsResponse);
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error in debug endpoint", e);
            debugInfo.put("error", e.getMessage());
            return ResponseEntity.status(500).body(debugInfo);
        }
    }

    private List<Map<String, Object>> processEvents(List<Map<String, Object>> events) {
        // Filter out past events
        LocalDateTime now = LocalDateTime.now();//gets the current date and time
        List<Map<String, Object>> futureEvents = new ArrayList<>();//for future events
        
        for (Map<String, Object> event : events) {
            if (event.containsKey("start_time")) {
                try {
                    String startTimeStr = (String) event.get("start_time");
                    LocalDateTime eventDate = LocalDateTime.parse(startTimeStr.substring(0, 19), 
                                                     DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    if (eventDate.isAfter(now)) {
                        futureEvents.add(event);
                    } else {
                        logger.info("Filtered out past event: " + event.get("name") + " with date " + startTimeStr);
                    }
                } catch (Exception e) {
                    // If we can't parse the date, include the event to be safe
                    logger.warning("Could not parse date for event filtering: " + e.getMessage());//
                    futureEvents.add(event);
                }
            } else {
                // If no start time, include the event
                futureEvents.add(event);
            }
        }
        
        // Sort events by start_time in ascending chronological order
        futureEvents.sort((e1, e2) -> {
            String startTime1 = (String) e1.get("start_time");
            String startTime2 = (String) e2.get("start_time");
            
            // Handle null values
            if (startTime1 == null) return startTime2 == null ? 0 : 1;
            if (startTime2 == null) return -1;
            
            // Compare dates
            return startTime1.compareTo(startTime2);
        });
        
        // Process event data to add image URLs and format dates
        for (Map<String, Object> event : futureEvents) {
            // Extract cover photo URL if available
            if (event.containsKey("cover")) {
                Map<String, Object> cover = (Map<String, Object>) event.get("cover");//casts the cover to a Map
                if (cover.containsKey("source")) {
                    event.put("image_url", cover.get("source"));
                }
            } else {
                // Use a default image if no cover is available
                event.put("image_url", "https://via.placeholder.com/300x200?text=Event");
            }
            
            // Format dates for display
            if (event.containsKey("start_time")) {
                String startTimeStr = (String) event.get("start_time");
                try {
                    LocalDateTime startTime = LocalDateTime.parse(startTimeStr.substring(0, 19), //parses the start time
                                                        DateTimeFormatter.ISO_LOCAL_DATE_TIME);//formats the start time
                    event.put("formatted_date", startTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
                    event.put("formatted_time", startTime.format(DateTimeFormatter.ofPattern("HH:mm")));
                } catch (Exception e) {
                    // Fallback in case of parsing error
                    logger.warning("Error parsing date: " + startTimeStr + ", " + e.getMessage());
                    event.put("formatted_date", startTimeStr);
                    event.put("formatted_time", "");
                }
            }
        }
        
        return futureEvents;
    }
    
    @GetMapping("/mock")
    public ResponseEntity<?> getMockEvents() {
        logger.info("Generating mock events");
        
        List<Map<String, Object>> mockEvents = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> event = new HashMap<>();
            
            // Create future dates for mock events
            LocalDateTime eventDate = now.plusMonths(i);
            String formattedDate = eventDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
            String formattedTime = "18:00";
            String isoDateTime = eventDate.withHour(18).withMinute(0).format(DateTimeFormatter.ISO_DATE_TIME);
            
            event.put("id", "mock" + i);
            event.put("name", "Mock Event " + i);
            event.put("description", "This is a mock event for testing when the Facebook API is unavailable.");
            event.put("image_url", "https://via.placeholder.com/300x200?text=Mock+Event+" + i);
            event.put("formatted_date", formattedDate);
            event.put("formatted_time", formattedTime);
            event.put("start_time", isoDateTime); // ISO format date for proper filtering
            
            mockEvents.add(event);
        }
        
        return ResponseEntity.ok(mockEvents);
    }
} 