package com.yamu.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;//to handle the response from the API
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;//to handle the GET requests
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;//to make the HTTP requests

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
@RequestMapping("/api/facebook-events")//Sets the base URL path
@CrossOrigin(origins = "*")//needed for frontend-backend communication
public class FacebookEventsController {
    private static final Logger logger = Logger.getLogger(FacebookEventsController.class.getName());
    private static final long TOKEN_REFRESH_INTERVAL = 5; // minutes

    @Value("${facebook.app.id}")
    private String appId;

    @Value("${facebook.app.secret}")
    private String appSecret;

    // Main page ID as specified by the user
    private final String pageId = "708620612326863"; // EVENT SRI LANKA page ID
    
    // Access token and refresh time tracking
    private String accessToken = "EAATqJ86HavgBO61Ro3esTINRmB0i7XRY9f28VomZAEmMbZA8ZAknHBVZC3UmGuRipRtfjE7wpbPxQbf3MMa1cHDU19g7um0P6tZCatjZApcYKPWJhn1VpCfsfwTsBIj4ow6sXERWQwNk1W8jjFrj0PhIeVm8P8FKSz16KZCn3pnOjH7NiTPXS1GjIThzuBDK41axcyhusvu3ycQTXAYOgjo1ObIqQZDZD";
    private LocalDateTime lastTokenRefresh = LocalDateTime.now();
    
    @Autowired
    private RestTemplate restTemplate;

    private boolean shouldRefreshToken() {
        return LocalDateTime.now().isAfter(lastTokenRefresh.plusMinutes(TOKEN_REFRESH_INTERVAL));
    }

    private void refreshAccessToken() {
        try {
            String refreshUrl = String.format(
                "https://graph.facebook.com/v18.0/oauth/access_token" +
                "?grant_type=fb_exchange_token" +
                "&client_id=%s" +
                "&client_secret=%s" +
                "&fb_exchange_token=%s",
                appId, appSecret, accessToken
            );
            
            Map<String, Object> response = restTemplate.getForObject(refreshUrl, Map.class);
            
            if (response != null && response.containsKey("access_token")) {
                accessToken = (String) response.get("access_token");
                lastTokenRefresh = LocalDateTime.now();
                logger.info("Access token refreshed successfully");
            } else {
                logger.warning("Failed to refresh access token: " + response);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error refreshing access token", e);
        }
    }

    private String getCurrentAccessToken() {
        if (shouldRefreshToken()) {
            refreshAccessToken();
        }
        return accessToken;
    }

    @GetMapping//used to fetch events from the primary endpoint
    public ResponseEntity<?> getEvents() {
        logger.info("Fetching Facebook events for page ID: " + pageId);//logs the page ID
        
        try {
            // Fetch events from the primary page ID
            Map<String, Object> response = fetchEventsFromPage(pageId);
            
            // Check for Facebook API error
            if (response.containsKey("error")) {
                logger.severe("Facebook API returned an error: " + response.get("error"));
                return ResponseEntity.status(500).body(response);
            }
            
            // Check if the response contains the 'data' field
            if (!response.containsKey("data")) {//checks if the response contains the 'data' field
                logger.warning("Response does not contain 'data' field: " + response);
                Map<String, Object> errorResponse = new HashMap<>();//creates a new HashMap to store the error response
                errorResponse.put("error", "Facebook API response missing 'data' field");
                return ResponseEntity.status(500).body(errorResponse);
            }
            
            List<Map<String, Object>> eventsData = (List<Map<String, Object>>) response.get("data");//casts the response to a List of Maps
            
            if (eventsData.isEmpty()) {
                logger.info("No events found for page");
                return ResponseEntity.ok(Collections.emptyList());//returns an empty list if no events are found:200 status code
            }
            
            List<Map<String, Object>> processedEvents = processEvents(eventsData);
            logger.info("Processed " + processedEvents.size() + " events");
            
            return ResponseEntity.ok(processedEvents);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error processing Facebook events", e);
            Map<String, Object> errorResponse = new HashMap<>();//creates a new HashMap to store the error response
            errorResponse.put("error", "Error fetching Facebook events: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);//returns a 500 status code and the error response
        }
    }
    
    private Map<String, Object> fetchEventsFromPage(String pageId) {
        try {
            String url = String.format(
                "https://graph.facebook.com/v18.0/%s/events?access_token=%s&fields=id,name,description,start_time,end_time,cover",
                pageId, getCurrentAccessToken());
            
            logger.info("Making request to Facebook Graph API: " + url);
            
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);//makes a GET request to the Facebook Graph API and returns the response as a Map
            if (response == null) {
                logger.warning("Received null response from Facebook API");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Received null response from Facebook API");
                return errorResponse;
            }
            
            logger.info("Received response from Facebook API: " + response);
            return response;
        } catch (RestClientException e) {
            logger.log(Level.SEVERE, "Error calling Facebook API", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to connect to Facebook API: " + e.getMessage());
            return errorResponse;
        }
    }
    
    @GetMapping("/debug")//used to debug the API
    public ResponseEntity<?> getDebugInfo() {
        logger.info("Fetching debug info for Facebook API");
        Map<String, Object> debugInfo = new HashMap<>();
        
        try {
            // 1: Page Information
            String pageUrl = String.format(
                "https://graph.facebook.com/v18.0/%s?access_token=%s",
                pageId, getCurrentAccessToken());
            
            logger.info("Making request to get page info: " + pageUrl);
            Map<String, Object> pageResponse = restTemplate.getForObject(pageUrl, Map.class);//makes a GET request to the Facebook Graph API and returns the response as a Map
            debugInfo.put("page_info", pageResponse);//adds the response to the debugInfo map
            
            // 2: Access Token Debug
            String tokenDebugUrl = String.format(
                "https://graph.facebook.com/debug_token?input_token=%s&access_token=%s",
                getCurrentAccessToken(), getCurrentAccessToken());
            
            logger.info("Making request to debug token: " + tokenDebugUrl);//logs the token debug URL
            Map<String, Object> tokenResponse = restTemplate.getForObject(tokenDebugUrl, Map.class);
            debugInfo.put("token_info", tokenResponse);
            
            // 3: Raw Events Call
            String eventsUrl = String.format(
                "https://graph.facebook.com/v18.0/%s/events?access_token=%s",
                pageId, getCurrentAccessToken());
            
            logger.info("Making basic events request: " + eventsUrl);
            Map<String, Object> eventsResponse = restTemplate.getForObject(eventsUrl, Map.class);
            debugInfo.put("events_basic", eventsResponse);
            
            // 4: Detailed Events Call
            String detailedEventsUrl = String.format(
                "https://graph.facebook.com/v18.0/%s/events?access_token=%s&fields=id,name,description,start_time,end_time,cover",
                pageId, getCurrentAccessToken());
            
            logger.info("Making detailed events request: " + detailedEventsUrl);//logs the detailed events URL
            Map<String, Object> detailedEventsResponse = restTemplate.getForObject(detailedEventsUrl, Map.class);
            debugInfo.put("events_detailed", detailedEventsResponse);//adds the response to the debugInfo map
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error in debug endpoint", e);
            debugInfo.put("error", e.getMessage());//adds the error message to the debugInfo map
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